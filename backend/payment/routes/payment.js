const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const router = express.Router();
const Payment = require('../models/Payment');
const { PAYMENT_METHODS } = require('../models/Payment');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL;
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL;

const serviceClient = axios.create({ timeout: 3000 });

function getToken(req) {
    const authHeader = req.header('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }

    return req.header('x-auth-token');
}

async function auth(req, res, next) {
    const token = getToken(req);
    if (!token) {
        return res.status(401).json({ message: 'Authentication token is required' });
    }

    if (!USER_SERVICE_URL) {
        return res.status(500).json({ message: 'User service URL is not configured' });
    }

    try {
        const response = await serviceClient.post(`${USER_SERVICE_URL}/verify`, { token });
        if (!response.data || !response.data.valid) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.user = { id: response.data.userId };
        next();
    } catch (error) {
        return res.status(503).json({ message: 'User service is unavailable' });
    }
}

function isRequiredString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function normalizeOrderId(orderId) {
    if (typeof orderId === 'number' && Number.isInteger(orderId) && orderId > 0) {
        return String(orderId);
    }

    if (typeof orderId === 'string' && orderId.trim().length > 0) {
        return orderId.trim();
    }

    return '';
}

function createTransactionId() {
    return `PAY-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

function normalizeVndAmount(value) {
    if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
        return value;
    }

    if (typeof value === 'string' && /^[1-9]\d*$/.test(value.trim())) {
        return Number(value.trim());
    }

    return null;
}

async function getOrder(orderId) {
    if (!ORDER_SERVICE_URL) {
        return null;
    }

    const response = await serviceClient.get(`${ORDER_SERVICE_URL}/orders/${orderId}`);
    return response.data;
}

function assertOrderMatchesPayment(order, userId, amount) {
    if (!order) {
        return;
    }

    if (order.user_id && order.user_id !== userId) {
        const error = new Error('You can only pay for your own order');
        error.statusCode = 403;
        throw error;
    }

    const orderTotal = normalizeVndAmount(String(order.total_amount));
    if (order.total_amount !== undefined && orderTotal !== amount) {
        const error = new Error('Payment amount does not match order total');
        error.statusCode = 400;
        error.orderTotal = orderTotal;
        throw error;
    }
}

function buildInitialPaymentStatus(method, simulateFailure) {
    if (simulateFailure) {
        return {
            status: 'failed',
            failureReason: 'Payment was declined by simulated provider'
        };
    }

    if (method === 'cash_on_delivery') {
        return { status: 'pending' };
    }

    return {
        status: 'success',
        transactionId: createTransactionId(),
        paidAt: new Date()
    };
}

router.post('/', auth, async (req, res) => {
    try {
        const orderId = normalizeOrderId(req.body.orderId);
        const amount = normalizeVndAmount(req.body.amount);
        const currency = 'VND';
        const method = typeof req.body.method === 'string' ? req.body.method.trim() : '';
        const simulateFailure = req.body.simulateFailure === true;

        if (!isRequiredString(orderId)) {
            return res.status(400).json({ message: 'orderId is required' });
        }

        if (amount === null) {
            return res.status(400).json({ message: 'amount must be a positive VND integer' });
        }

        if (!PAYMENT_METHODS.includes(method)) {
            return res.status(400).json({
                message: 'payment method is invalid',
                allowedMethods: PAYMENT_METHODS
            });
        }

        const paidPayment = await Payment.findOne({
            userId: req.user.id,
            orderId,
            status: { $in: ['success', 'refunded'] }
        });

        if (paidPayment) {
            return res.status(409).json({
                message: 'Order has already been paid',
                payment: paidPayment
            });
        }

        try {
            const order = await getOrder(orderId);
            assertOrderMatchesPayment(order, req.user.id, amount);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return res.status(404).json({ message: 'Order not found' });
            }

            if (error.statusCode) {
                return res.status(error.statusCode).json({
                    message: error.message,
                    orderTotal: error.orderTotal
                });
            }

            return res.status(503).json({ message: 'Order service is unavailable' });
        }

        const statusInfo = buildInitialPaymentStatus(method, simulateFailure);
        const payment = await Payment.create({
            userId: req.user.id,
            orderId,
            amount,
            currency,
            method,
            ...statusInfo
        });

        return res.status(201).json(payment);
    } catch (error) {
        return res.status(500).json({ message: 'Server error while creating payment' });
    }
});

router.get('/', auth, async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.user.id }).sort({ createdAt: -1 });
        return res.status(200).json({ data: payments, count: payments.length });
    } catch (error) {
        return res.status(500).json({ message: 'Server error while reading payments' });
    }
});

router.get('/order/:orderId', auth, async (req, res) => {
    try {
        const orderId = normalizeOrderId(req.params.orderId);
        if (!isRequiredString(orderId)) {
            return res.status(400).json({ message: 'orderId is required' });
        }

        const payments = await Payment.find({ userId: req.user.id, orderId }).sort({ createdAt: -1 });
        return res.status(200).json({ data: payments, count: payments.length });
    } catch (error) {
        return res.status(500).json({ message: 'Server error while reading order payments' });
    }
});

router.get('/:paymentId', auth, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.paymentId);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (payment.userId !== req.user.id) {
            return res.status(403).json({ message: 'You can only access your own payment' });
        }

        return res.status(200).json(payment);
    } catch (error) {
        return res.status(500).json({ message: 'Server error while reading payment' });
    }
});

router.put('/:paymentId/confirm', auth, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.paymentId);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (payment.userId !== req.user.id) {
            return res.status(403).json({ message: 'You can only confirm your own payment' });
        }

        if (payment.status === 'success') {
            return res.status(200).json(payment);
        }

        if (payment.status === 'refunded') {
            return res.status(400).json({ message: 'Refunded payment cannot be confirmed' });
        }

        payment.status = 'success';
        payment.transactionId = payment.transactionId || createTransactionId();
        payment.failureReason = undefined;
        payment.paidAt = payment.paidAt || new Date();

        await payment.save();
        return res.status(200).json(payment);
    } catch (error) {
        return res.status(500).json({ message: 'Server error while confirming payment' });
    }
});

router.post('/:paymentId/refund', auth, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.paymentId);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (payment.userId !== req.user.id) {
            return res.status(403).json({ message: 'You can only refund your own payment' });
        }

        if (payment.status !== 'success') {
            return res.status(400).json({ message: 'Only successful payments can be refunded' });
        }

        payment.status = 'refunded';
        payment.refundedAt = new Date();

        await payment.save();
        return res.status(200).json(payment);
    } catch (error) {
        return res.status(500).json({ message: 'Server error while refunding payment' });
    }
});

module.exports = router;
