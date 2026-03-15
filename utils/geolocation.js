/* Geolocation utilities */
const requestIp = require('request-ip');
const axios = require('axios');

function getClientIP(req) {
    const xForwardedFor = req.headers['x-forwarded-for'];
    let ip = xForwardedFor ? xForwardedFor.split(',')[0].trim() : (req.connection.remoteAddress || req.socket.remoteAddress || requestIp.getClientIp(req));

    if (ip && ip.startsWith('::ffff:')) {
        ip = ip.replace('::ffff:', '');
    }

    if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
        return '127.0.0.1';
    }

    return ip;
}

async function getGeolocation(ip) {
    // Fallback for localhost development
    if (ip === '127.0.0.1' || ip === '::1') {
        ip = '110.227.199.146';
    }

    try {
        const response = await axios.get(`http://ip-api.com/json/${ip}`);
        const data = response.data;

        if (data.status === 'fail') {
            return { location: 'Unknown', latitude: 0, longitude: 0, region: 'Unknown' };
        }

        const city = data.city || 'Unknown';
        const regionCode = data.region || 'Unknown';
        const country = data.country || 'Unknown';

        let location = 'Unknown';
        if (city !== 'Unknown' && country !== 'Unknown') {
            location = `${city}, ${country}`;
        } else {
            location = country;
        }

        return {
            location,
            latitude: data.lat || 0,
            longitude: data.lon || 0,
            region: regionCode
        };

    } catch (error) {
        console.error('Geo API Error:', error.message);
        return { location: 'Unknown', latitude: 0, longitude: 0, region: 'Unknown' };
    }
}

function maskIP(ip) {
    if (!ip || ip === 'Unknown') return 'Unknown';

    // IPv4
    if (ip.includes('.')) {
        const parts = ip.split('.');
        if (parts.length === 4) return `${parts[0]}.${parts[1]}.xx.xx`;
    }

    // IPv6
    if (ip.includes(':')) {
        const parts = ip.split(':');
        if (parts.length >= 2) return `${parts[0]}:${parts[1]}:xx:xx`;
    }

    return 'xx.xx.xx.xx';
}

module.exports = {
    getClientIP,
    getGeolocation,
    maskIP
};
