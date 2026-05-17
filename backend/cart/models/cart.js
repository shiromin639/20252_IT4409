const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    items: [{
        productId: {
            type: String,
            required: true,
            trim: true
        },
        quantity: {
            type: Number,
            default: 1,
            min: 1
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);
