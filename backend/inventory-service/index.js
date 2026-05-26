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
    res.json({ service: 'inventory', status: 'ok' });
});

if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not configured for Inventory Service');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected for Inventory Service'))
    .catch((err) => console.error('Inventory Service database connection error:', err));

const inventoryRoute = require('./routes/inventory');
app.use('/api/inventory', inventoryRoute);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
    console.log(`Inventory Service is running on port ${PORT}`);
});
