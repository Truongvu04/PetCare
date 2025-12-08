import { prisma } from '../config/prisma.js';
import { buildPaymentUrl, verifySignature } from '../services/vnpayService.js';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// 1. Tạo URL thanh toán
async function createVnpay(req, res) {
  try {
    const { orderId } = req.body;
    const user_id = req.user?.user_id;
    
    const testAmount = req.body?.testAmount ? Number(req.body.testAmount) : null;

    if (!orderId) return res.status(400).json({ error: 'Missing orderId' });

    const order = await prisma.orders.findUnique({ where: { order_id: Number(orderId) } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.user_id !== user_id) return res.status(403).json({ error: 'Unauthorized' });

    let ipAddr = req.headers['x-forwarded-for'] ||
                 req.connection.remoteAddress ||
                 req.socket.remoteAddress ||
                 req.connection.socket.remoteAddress;

    // 1. Nếu IP là IPv6 localhost (::1), ép về 127.0.0.1
    if (ipAddr === '::1') {
        ipAddr = '127.0.0.1';
    }
    
    // 2. Nếu IP có nhiều giá trị (proxy), lấy cái đầu tiên
    if (ipAddr && ipAddr.includes(',')) {
        ipAddr = ipAddr.split(',')[0].trim();
    }
    
    // 3. Fallback cuối cùng
    if (!ipAddr) {
        ipAddr = '127.0.0.1';
    }

    // Logic tính tiền
    let amountVND = Number(order.total);
    if (testAmount && !Number.isNaN(testAmount)) {
      amountVND = testAmount;
    }
    amountVND = Math.round(amountVND);

    console.log(`[vnpay] Creating URL for Order ${order.order_id}. Amount: ${amountVND} VND. IP: ${ipAddr}`);

    // Truyền ipAddr đã xử lý vào service
    const { url, txnRef } = buildPaymentUrl({ 
        amount: amountVND, 
        orderId: order.order_id, 
        orderInfo: `Payment for order ${order.order_id}`,
        ipAddr: ipAddr 
    });

    // Tạo record payment
    const payment = await prisma.payments.create({
      data: {
        order_id: order.order_id,
        user_id: user_id,
        amount: amountVND, 
        method: 'vnpay',
        status: 'pending',
        transaction_id: txnRef 
      }
    });

    return res.status(200).json({ paymentUrl: url, paymentId: payment.payment_id });
  } catch (err) {
    console.error('createVnpay error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// 2. Xử lý Redirect về Frontend (GET)
async function vnpayReturn(req, res) {
  try {
    const query = req.query;
    const valid = verifySignature(query);
    const vnp_ResponseCode = query.vnp_ResponseCode;
    const vnp_TxnRef = query.vnp_TxnRef;
    const vnp_TransactionNo = query.vnp_TransactionNo;
    const vnp_BankCode = query.vnp_BankCode;
    const vnp_CardType = query.vnp_CardType;

    if (!vnp_TxnRef) return res.status(400).send('Missing txn ref');

    const payment = await prisma.payments.findFirst({ where: { transaction_id: vnp_TxnRef } });
    if (!payment) return res.redirect(`${FRONTEND_URL}/order-confirmation?status=missing`);

    if (!valid) {
      await prisma.payments.update({ where: { payment_id: payment.payment_id }, data: { status: 'fail' } });
      return res.redirect(`${FRONTEND_URL}/order-confirmation?orderId=${payment.order_id}&status=fail`);
    }

    if (vnp_ResponseCode === '00') {
      await prisma.payments.update({
        where: { payment_id: payment.payment_id },
        data: { status: 'success', transaction_id: vnp_TransactionNo }
      });
      await prisma.orders.update({ where: { order_id: payment.order_id }, data: { status: 'paid' } });
      return res.redirect(`${FRONTEND_URL}/order-confirmation?orderId=${payment.order_id}&status=success`);
    }

    await prisma.payments.update({ where: { payment_id: payment.payment_id }, data: { status: 'fail' } });
    return res.redirect(`${FRONTEND_URL}/order-confirmation?orderId=${payment.order_id}&status=fail`);

  } catch (err) {
    console.error('vnpayReturn error:', err);
    return res.status(500).send('Internal server error');
  }
}

// 3. Xử lý IPN (Server-to-Server)
async function vnpayIpn(req, res) {
  try {
    const params = req.method === 'GET' ? req.query : req.body;
    const valid = verifySignature(params);

    const vnp_TxnRef = params.vnp_TxnRef;
    const vnp_ResponseCode = params.vnp_ResponseCode;
    const vnp_TransactionNo = params.vnp_TransactionNo;
    const vnp_BankCode = params.vnp_BankCode;
    const vnp_CardType = params.vnp_CardType;
    const vnp_Amount = params.vnp_Amount; // Đơn vị: VND * 100

    if (!vnp_TxnRef) {
      return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
    }

    const payment = await prisma.payments.findFirst({ where: { transaction_id: vnp_TxnRef } });
    if (!payment) {
      return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
    }

    // Validate số tiền (đề phòng request giả mạo)
    // VNPay trả về amount * 100, nên cần chia 100 để so sánh với DB
    const checkAmount = parseInt(vnp_Amount) / 100;
    if (Math.abs(checkAmount - Number(payment.amount)) > 1) { 
        // Cho phép sai số 1 VND do làm tròn
        console.error(`[vnpay] Amount mismatch. VNPay: ${checkAmount}, DB: ${payment.amount}`);
        return res.status(200).json({ RspCode: '04', Message: 'Invalid amount' });
    }

    // Checksum fail
    if (!valid) {
      console.error(`[vnpay] IPN Invalid signature`);
      return res.status(200).json({ RspCode: '97', Message: 'Invalid signature' });
    }

    // Idempotency: Nếu giao dịch đã cập nhật rồi thì không làm gì nữa
    if (payment.status === 'success' && vnp_ResponseCode === '00') {
        return res.status(200).json({ RspCode: '00', Message: 'Order already confirmed' });
    }

    // Xử lý thành công
    if (vnp_ResponseCode === '00') {
      await prisma.payments.update({ 
        where: { payment_id: payment.payment_id }, 
        data: { 
            status: 'success',
            transaction_id: vnp_TransactionNo
        } 
      });

      await prisma.orders.update({ 
        where: { order_id: payment.order_id }, 
        data: { status: 'paid' } 
      });

      return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
    }

    // Xử lý thất bại
    await prisma.payments.update({ 
        where: { payment_id: payment.payment_id }, 
        data: { status: 'fail' } 
    });
    
    return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' }); 

  } catch (err) {
    console.error('vnpayIpn error:', err);
    return res.status(200).json({ RspCode: '99', Message: 'Internal error' });
  }
}

export { createVnpay, vnpayReturn, vnpayIpn };