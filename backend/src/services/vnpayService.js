import crypto from 'crypto';

const VNPAY_TMN_CODE = process.env.VNPAY_TMN_CODE || process.env.vnp_TmnCode;
const VNPAY_SECRET = process.env.VNPAY_SECRET || process.env.vnp_HashSecret;
const VNPAY_URL = process.env.VNPAY_URL || process.env.vnp_Url;
const VNPAY_RETURN_URL = process.env.VNPAY_RETURN_URL || process.env.vnp_ReturnUrl;

function formatDateYYYYMMDDHHMMSS(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

function buildVnpParams({ amount, orderId, locale = 'vn', orderInfo = '', ipAddr = '127.0.0.1' }) {
  const createDate = new Date();
  const vnp_TxnRef = `${orderId}-${Date.now()}`;
  
  const params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: VNPAY_TMN_CODE,
    vnp_Amount: String(Math.round(amount * 100)),
    vnp_CurrCode: 'VND',
    vnp_TxnRef,
    vnp_OrderInfo: orderInfo || `Payment for order ${orderId}`,
    vnp_OrderType: 'other',
    vnp_Locale: locale,
    vnp_ReturnUrl: VNPAY_RETURN_URL,
    vnp_IpAddr: ipAddr, 
    vnp_CreateDate: formatDateYYYYMMDDHHMMSS(createDate)
  };
  return { params, vnp_TxnRef };
}

// --- FIX MÃ HÓA: Replace %20 bằng + ---
function buildQueryString(sortedParams) {
  return Object.keys(sortedParams)
    .map((k) => {
        // Encode URI và thay thế %20 thành + theo chuẩn VNPay
        const value = encodeURIComponent(sortedParams[k]).replace(/%20/g, "+");
        return `${k}=${value}`;
    })
    .join('&');
}

function signParams(params) {
  const sorted = {};
  Object.keys(params)
    .sort()
    .forEach((k) => {
      sorted[k] = params[k];
    });
  const signData = buildQueryString(sorted);
  console.log('[vnpay] signData:', signData);
  
  const hmac = crypto.createHmac('sha512', VNPAY_SECRET || '');
  const vnp_SecureHash = hmac.update(signData).digest('hex');
  return { signData, vnp_SecureHash };
}

function buildPaymentUrl({ amount, orderId, locale = 'vn', orderInfo = '', ipAddr = '127.0.0.1' }) {
  if (!VNPAY_TMN_CODE || !VNPAY_SECRET || !VNPAY_URL || !VNPAY_RETURN_URL) {
    throw new Error('Missing VNPAY configuration. Set VNPAY_TMN_CODE, VNPAY_SECRET, VNPAY_URL, VNPAY_RETURN_URL in env.');
  }

  const { params, vnp_TxnRef } = buildVnpParams({ amount, orderId, locale, orderInfo, ipAddr });
  
  const { signData, vnp_SecureHash } = signParams(params);
  const query = signData + '&vnp_SecureHash=' + vnp_SecureHash;
  
  const fullUrl = `${VNPAY_URL}?${query}&vnp_SecureHashType=SHA512`;
  return { url: fullUrl, txnRef: vnp_TxnRef };
}

function verifySignature(queryObj) {
  if (!queryObj || !queryObj.vnp_SecureHash) return false;
  const data = { ...queryObj };
  delete data.vnp_SecureHash;
  delete data.vnp_SecureHashType;
  const sorted = {};
  Object.keys(data)
    .sort()
    .forEach((k) => (sorted[k] = data[k]));
  const signData = buildQueryString(sorted);
  const hmac = crypto.createHmac('sha512', VNPAY_SECRET || '');
  const computed = hmac.update(signData).digest('hex');
  return computed === queryObj.vnp_SecureHash;
}
export { buildPaymentUrl, verifySignature };