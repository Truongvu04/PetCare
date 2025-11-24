import axios from 'axios';
import CryptoJS from 'crypto-js';
import moment from 'moment'; // Bạn cần cài thư viện này: npm install moment

const config = {
  app_id: process.env.ZALOPAY_APP_ID,
  key1: process.env.ZALOPAY_KEY1,
  key2: process.env.ZALOPAY_KEY2,
  endpoint: process.env.ZALOPAY_ENDPOINT,
  callback_url: process.env.ZALOPAY_CALLBACK_URL
};

export const createOrder = async ({ orderId, amount, items = [], description = '' }) => {
  const embed_data = {
    redirecturl: "http://localhost:3000/order-confirmation",
    merchantinfo: "pet_care_app"
  };

  const transID = Math.floor(Math.random() * 1000000);
  // app_trans_id phải có dạng: yyMMdd_xxxxxxxxx
  const app_trans_id = `${moment().format('YYMMDD')}_${transID}`;

  const order = {
    app_id: config.app_id,
    app_trans_id: app_trans_id, 
    app_user: "user_demo",
    app_time: Date.now(), // miliseconds
    item: JSON.stringify(items),
    embed_data: JSON.stringify(embed_data),
    amount: amount,
    description: description || `Thanh toan don hang #${orderId}`,
    bank_code: "", // Để trống để hiện danh sách ngân hàng/ví
    callback_url: config.callback_url 
  };

  // Tạo chữ ký (MAC) theo thứ tự quy định: app_id|app_trans_id|app_user|amount|app_time|embed_data|item
  const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
  order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

  try {
    const result = await axios.post(config.endpoint, null, { params: order });
    return { ...result.data, app_trans_id };
  } catch (error) {
    console.error("ZaloPay Create Order Error:", error.message);
    throw error;
  }
};

export const verifyCallback = (dataStr, reqMac) => {
  const mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
  return mac === reqMac;
};