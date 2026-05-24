const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const paymentRoutes = require('./routes/payment');

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : true;

app.use(express.json());
app.use(cors({ origin: allowedOrigins }));

app.get('/health', (req, res) => {
    res.json({ service: 'payment', status: 'ok' });
});

if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not configured for Payment Service');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected for Payment Service'))
    .catch((err) => console.error('Payment Service database connection error:', err));

app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Payment Service is running on port ${PORT}`);
});
