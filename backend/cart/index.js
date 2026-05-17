const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : true;

app.use(express.json());
app.use(cors({ origin: allowedOrigins }));

app.get('/health', (req, res) => {
    res.json({ service: 'cart', status: 'ok' });
});

if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not configured for Cart Service');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected for Cart Service'))
    .catch((err) => console.error('Cart Service database connection error:', err));

const cartRoute = require('./routes/cart');
app.use('/api/cart', cartRoute);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Cart Service is running on port ${PORT}`);
});
