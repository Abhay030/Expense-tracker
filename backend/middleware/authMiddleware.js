const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'User no longer exists' });
        }

        next();
    }
    catch (error) {
        // Distinguish between expired and invalid tokens
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Session expired. Please log in again.',
                expired: true  // Frontend can use this to show appropriate UI
            });
        }
        return res.status(401).json({ message: 'Invalid token. Please log in again.' });
    }
};