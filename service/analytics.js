/* Analytics tracking service */
const URLModel = require('../models/url');
const { getOSType, getDeviceType, getReferrerSource } = require('../utils/analytics');
const { getClientIP, getGeolocation } = require('../utils/geolocation');

async function trackVisit(shortId, req) {
    const userAgentString = req.headers['user-agent'] || '';

    const deviceType = getDeviceType(userAgentString);
    if (deviceType === 'Bot') {
        console.log('🤖 Bot detected, skipping track.');
        return;
    }

    const userIp = getClientIP(req);
    const geoData = await getGeolocation(userIp);

    const visitEntry = {
        timestamp: Date.now(),
        device: deviceType,
        os: getOSType(userAgentString),
        ip: userIp,
        location: geoData.location,
        referrer: getReferrerSource(req),
        latitude: geoData.latitude,
        longitude: geoData.longitude,
        region: geoData.region
    };

    await URLModel.findOneAndUpdate(
        { shortId },
        { $push: { visitHistory: visitEntry } }
    );
}

module.exports = {
    trackVisit
};
