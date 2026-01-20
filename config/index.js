/* Configuration management */
require('dotenv').config();

const config = {
    // Server
    port: process.env.PORT || 8000,
    env: process.env.NODE_ENV || 'development',

    // Database
    mongoUrl: process.env.MONGO_URL,

    // JWT
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-here',

    // API Keys
    geoApiUrl: 'http://ip-api.com/json',
    localhostFallbackIP: '110.227.199.146',

    // App
    timezone: 'Asia/Kolkata',
    shortIdLength: 8
};

module.exports = config;
