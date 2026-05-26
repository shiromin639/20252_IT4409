const express = require('express');
const axios = require('axios');
const router = express.Router();
const Cart = require('../models/Cart');

const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL;
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL ;

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

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function isRequiredString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function ensureOwner(req, res, next) {
  if (req.params.userId && req.params.userId !== req.user.id) {
    return res.status(403).json({ message: 'You can only access your own cart' });
  }

  next();
}

async function buildCartResponse(userId, res) {
  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return res.status(200).json({ userId, items: [], totalItems: 0 });
  }

  const enrichedItems = await Promise.all(cart.items.map(async (item) => {
    if (!PRODUCT_SERVICE_URL) {
      return item.toObject();
    }

    try {
      const response = await serviceClient.get(`${PRODUCT_SERVICE_URL}/${item.productId}`);
      const productDetail = response.data;

      return {
        productId: item.productId,
        quantity: item.quantity,
        name: productDetail.name,
        price: productDetail.price,
        image: productDetail.image
      };
    } catch (error) {
      return { ...item.toObject(), message: 'Product detail is unavailable' };
    }
  }));

  return res.status(200).json({
    userId: cart.userId,
    items: enrichedItems,
    totalItems: enrichedItems.length
  });
}

router.post('/', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (!isRequiredString(productId)) {
      return res.status(400).json({ message: 'productId is required' });
    }

    if (!isPositiveInteger(quantity)) {
      return res.status(400).json({ message: 'quantity must be a positive integer' });
    }

    if (!INVENTORY_SERVICE_URL) {
      return res.status(500).json({ message: 'Inventory service URL is not configured' });
    }

    let cart = await Cart.findOne({ userId });
    let currentQuantityInCart = 0;

    if (cart) {
      const itemIndex = cart.items.findIndex(item => item.productId === productId);
      if (itemIndex > -1) {
        currentQuantityInCart = cart.items[itemIndex].quantity;
      }
    }

    const totalRequestedQuantity = currentQuantityInCart + quantity;

    try {
      const inventoryResponse = await serviceClient.get(`${INVENTORY_SERVICE_URL}/${productId}`);
      const stockAvailable = inventoryResponse.data.stock;

      if (totalRequestedQuantity > stockAvailable) {
        return res.status(400).json({
          message: 'Not enough stock',
          stockAvailable,
          requestedQuantity: totalRequestedQuantity
        });
      }
    } catch (inventoryError) {
      if (inventoryError.response && inventoryError.response.status === 404) {
        return res.status(404).json({ message: 'Product does not exist in inventory' });
      }

      return res.status(503).json({ message: 'Inventory service is unavailable' });
    }

    if (cart) {
      const itemIndex = cart.items.findIndex(item => item.productId === productId);

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }

      cart = await cart.save();
      return res.status(200).json(cart);
    }

    const newCart = await Cart.create({
      userId,
      items: [{ productId, quantity }]
    });

    return res.status(201).json(newCart);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error while adding item to cart' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    return buildCartResponse(req.user.id, res);
  } catch (error) {
    return res.status(500).json({ message: 'System error' });
  }
});

router.get('/:userId', auth, ensureOwner, async (req, res) => {
  try {
    return buildCartResponse(req.user.id, res);
  } catch (error) {
    return res.status(500).json({ message: 'System error' });
  }
});

router.delete('/:userId/item/:productId', auth, ensureOwner, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    if (!isRequiredString(productId)) {
      return res.status(400).json({ message: 'productId is required' });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.productId !== productId);

    await cart.save();
    return res.status(200).json(cart);
  } catch (error) {
    return res.status(500).json({ message: 'Server error while deleting item' });
  }
});

module.exports = router;
