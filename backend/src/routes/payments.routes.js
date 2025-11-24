import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { createVnpay, vnpayReturn, vnpayIpn } from '../controllers/paymentController.js';

const router = express.Router();

// Create VNPay payment and return payment URL
router.post('/vnpay/create', verifyToken, createVnpay);

// VNPay will redirect the customer to this URL after payment
router.get('/vnpay_return', vnpayReturn);

// VNPay IPN (server-to-server) — accept both GET and POST
router.post('/vnpay_ipn', vnpayIpn);
router.get('/vnpay_ipn', vnpayIpn);

export default router;
