const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

/**
 * Middleware to authenticate user via JWT.
 */
const authenticateUser = async (req, res, next) => {
    let token;
    try {
        // Check if there's a token in the Authorization header.
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // If no token is provided, respond with an error.
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        // Verify the JWT token using the secret key and decode the payload.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user by the ID from the token and exclude the password field.
        req.user = await User.findById(decoded.id).select('-password');

        // If user is not found, return an error.
        if (!req.user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Proceed to the next middleware or route handler.
        next();
    } catch (error) {
        // Catch any errors that occurred during token verification and respond accordingly.
        res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

/**
 * Middleware to authorize based on specific roles.
 * @param {...string} allowedRoles - Roles that are allowed to access the route.
 */
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // Check if the user's role matches any of the allowed roles.
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
        }

        // If the user has the required role, proceed to the next middleware or route handler.
        next();
    };
};

module.exports = {
    authenticateUser,
    authorizeRoles
};
