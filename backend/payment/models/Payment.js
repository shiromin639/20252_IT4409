const mongoose = require('mongoose');

const PAYMENT_METHODS = ['card', 'bank_transfer', 'e_wallet', 'cash_on_delivery'];
const PAYMENT_STATUSES = ['pending', 'success', 'failed', 'refunded'];

const PaymentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    orderId: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 1,
        validate: {
            validator: Number.isInteger,
            message: 'amount must be a VND integer'
        }
    },
    currency: {
        type: String,
        default: 'VND',
        trim: true,
        uppercase: true
    },
    method: {
        type: String,
        required: true,
        enum: PAYMENT_METHODS
    },
    status: {
        type: String,
        enum: PAYMENT_STATUSES,
        default: 'pending',
        index: true
    },
    transactionId: {
        type: String,
        trim: true
    },
    failureReason: {
        type: String,
        trim: true
    },
    paidAt: {
        type: Date
    },
    refundedAt: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
module.exports.PAYMENT_METHODS = PAYMENT_METHODS;
module.exports.PAYMENT_STATUSES = PAYMENT_STATUSES;
