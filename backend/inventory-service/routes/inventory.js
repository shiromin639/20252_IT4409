const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');

function isRequiredString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function isNonNegativeInteger(value) {
    return Number.isInteger(value) && value >= 0;
}

function isPositiveInteger(value) {
    return Number.isInteger(value) && value > 0;
}

router.post('/', async (req, res) => {
    try {
        const { productId, stock } = req.body;

        if (!isRequiredString(productId)) {
            return res.status(400).json({ message: 'productId is required' });
        }

        if (!isNonNegativeInteger(stock)) {
            return res.status(400).json({ message: 'stock must be a non-negative integer' });
        }

        const inventoryItem = await Inventory.findOneAndUpdate(
            { productId },
            {
                $setOnInsert: { productId },
                $inc: { stock }
            },
            { new: true, upsert: true, runValidators: true }
        );

        return res.status(200).json(inventoryItem);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error while adding stock' });
    }
});

router.get('/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        if (!isRequiredString(productId)) {
            return res.status(400).json({ message: 'productId is required' });
        }

        const inventoryItem = await Inventory.findOne({ productId });

        if (!inventoryItem) {
            return res.status(404).json({ message: 'Product does not exist in inventory', stock: 0 });
        }

        return res.status(200).json(inventoryItem);
    } catch (error) {
        return res.status(500).json({ message: 'Server error while checking inventory' });
    }
});

router.put('/deduct', async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!isRequiredString(productId)) {
            return res.status(400).json({ message: 'productId is required' });
        }

        if (!isPositiveInteger(quantity)) {
            return res.status(400).json({ message: 'quantity must be a positive integer' });
        }

        const inventoryItem = await Inventory.findOneAndUpdate(
            { productId, stock: { $gte: quantity } },
            { $inc: { stock: -quantity } },
            { new: true, runValidators: true }
        );

        if (inventoryItem) {
            return res.status(200).json({ message: 'Stock deducted successfully', inventoryItem });
        }

        const existingItem = await Inventory.findOne({ productId });
        if (!existingItem) {
            return res.status(404).json({ message: 'Product does not exist in inventory' });
        }

        return res.status(400).json({
            message: 'Not enough stock',
            currentStock: existingItem.stock
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error while deducting stock' });
    }
});

module.exports = router;
