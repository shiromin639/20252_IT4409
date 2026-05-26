const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', InventorySchema);
