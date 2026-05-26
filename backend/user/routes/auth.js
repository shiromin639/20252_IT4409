const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');

function isRequiredString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeUser(user) {
    return {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
    };
}

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        const normalizedUsername = typeof username === 'string' ? username.trim() : '';

        if (!isRequiredString(normalizedUsername)) {
            return res.status(400).json({ message: 'username is required' });
        }

        if (!isValidEmail(normalizedEmail)) {
            return res.status(400).json({ message: 'email is invalid' });
        }

        if (typeof password !== 'string' || password.length < 6) {
            return res.status(400).json({ message: 'password must be at least 6 characters' });
        }

        const existingUser = await User.findOne({
            $or: [{ username: normalizedUsername }, { email: normalizedEmail }]
        });

        if (existingUser) {
            return res.status(409).json({ message: 'username or email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username: normalizedUsername,
            email: normalizedEmail,
            password: hashedPassword
        });

        await newUser.save();
        return res.status(201).json({
            message: 'Register successful',
            user: sanitizeUser(newUser)
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'username or email already exists' });
        }

        return res.status(500).json({ message: 'Server error while registering' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

        if (!isValidEmail(normalizedEmail) || typeof password !== 'string') {
            return res.status(400).json({ message: 'Email or password is incorrect' });
        }

        const user = await User.findOne({ email: normalizedEmail }).select('+password');
        if (!user) {
            return res.status(400).json({ message: 'Email or password is incorrect' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email or password is incorrect' });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'JWT secret is not configured' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token, user: sanitizeUser(user) });
    } catch (err) {
        return res.status(500).json({ message: 'Server error while logging in' });
    }
});

router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json(user);
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

// 2. API Xác thực nội bộ 
router.post('/verify', async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ valid: false });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ valid: false });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Trả về thông tin cơ bản để service khác sử dụng
        return res.json({ valid: true, userId: decoded.id });
    } catch (err) {
        return res.json({ valid: false });
    }
});

router.put('/update', auth, async (req, res) => {
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';

    if (!isRequiredString(username)) {
        return res.status(400).json({ message: 'username is required' });
    }

    try {
        const duplicateUser = await User.findOne({
            username,
            _id: { $ne: req.user.id }
        });

        if (duplicateUser) {
            return res.status(409).json({ message: 'username already exists' });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { username },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json({ message: 'Update successful', user });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'username already exists' });
        }

        return res.status(500).json({ message: 'Server error while updating user' });
    }
});

module.exports = router;
