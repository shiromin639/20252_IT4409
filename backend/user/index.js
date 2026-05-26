require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ service: 'user', status: 'ok' });
});

if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not configured for User Service');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected for User Service'))
    .catch(err => console.error('User Service database connection error:', err));

app.use('/api/users', authRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`User Service is running on port ${PORT}`));
