const jwt = require('jsonwebtoken');

function getToken(req) {
    const authHeader = req.header('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }

    return req.header('x-auth-token');
}

module.exports = function(req, res, next) {
    const token = getToken(req);
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'JWT secret is not configured.' });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
};
