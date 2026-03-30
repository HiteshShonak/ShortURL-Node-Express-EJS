const rateLimit = require('express-rate-limit');
const config = require('../config');

const globalLimiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMaxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/api/ping',
    message: {
        error: 'Too many requests. Please try again in a few minutes.'
    }
});

const authLimiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.authRateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: {
        error: 'Too many login attempts. Please try again in 15 minutes.'
    }
});

module.exports = {
    globalLimiter,
    authLimiter
};
