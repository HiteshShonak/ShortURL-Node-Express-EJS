/* Configuration management */
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

function toPositiveInt(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const mongoUrl = process.env.MONGO_URL;
if (!mongoUrl) {
    throw new Error('MONGO_URL is required. Add it to your environment variables.');
}

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    throw new Error('JWT_SECRET is required. Add it to your environment variables.');
}

const parsedVisitHistoryLimit = toPositiveInt(process.env.VISIT_HISTORY_LIMIT, 5000);
const rateLimitWindowMinutes = toPositiveInt(process.env.RATE_LIMIT_WINDOW_MINUTES, 15);

const trustProxyEnv = process.env.TRUST_PROXY;
const trustProxy = trustProxyEnv === undefined
    ? isProduction
    : trustProxyEnv === '1' || trustProxyEnv === 'true';

const config = {
    // Server
    port: process.env.PORT || 8000,
    env: process.env.NODE_ENV || 'development',

    // Database
    mongoUrl,

    // JWT
    jwtSecret,

    // Auth Cookies
    cookieSecure: process.env.COOKIE_SECURE
        ? process.env.COOKIE_SECURE === '1' || process.env.COOKIE_SECURE === 'true'
        : isProduction,
    cookieSameSite: process.env.COOKIE_SAME_SITE || 'lax',

    // Deployment
    appBaseUrl: process.env.APP_BASE_URL || '',
    trustProxy,

    // Security
    rateLimitWindowMs: rateLimitWindowMinutes * 60 * 1000,
    rateLimitMaxRequests: toPositiveInt(process.env.RATE_LIMIT_MAX_REQUESTS, isProduction ? 300 : 1200),
    authRateLimitMax: toPositiveInt(process.env.AUTH_RATE_LIMIT_MAX, 10),

    // API Keys
    geoApiUrl: 'http://ip-api.com/json',
    localhostFallbackIP: '110.227.199.146',

    // App
    timezone: 'Asia/Kolkata',
    shortIdLength: 8,
    visitHistoryLimit: parsedVisitHistoryLimit
};

module.exports = config;
