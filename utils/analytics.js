/* Analytics detection utilities */

function getOSType(userAgent) {
    if (!userAgent) return 'Unknown';
    const ua = userAgent.toLowerCase();

    if (ua.includes('android')) return 'Android';
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'iOS';
    if (ua.includes('windows phone')) return 'Windows Phone';
    if (ua.includes('win')) return 'Windows';
    if (ua.includes('mac') || ua.includes('darwin')) return 'macOS';
    if (ua.includes('cros')) return 'Chrome OS';
    if (ua.includes('linux') || ua.includes('ubuntu')) return 'Linux';

    return 'Other';
}

function getDeviceType(userAgent) {
    if (!userAgent) return 'Desktop';
    const ua = userAgent.toLowerCase();

    if (ua.includes('bot') || ua.includes('crawl') || ua.includes('spider') || ua.includes('googlebot')) return 'Bot';
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'Mobile';
    if (ua.includes('tablet') || ua.includes('ipad')) return 'Tablet';

    return 'Desktop';
}

function getReferrerSource(req) {
    const manualSource = req.query.source || req.query.utm_source;
    if (manualSource) return manualSource;

    const referrerHeader = req.headers['referer'] || req.headers['referrer'];
    if (!referrerHeader) return 'Direct';

    try {
        const urlObj = new URL(referrerHeader);
        const hostname = urlObj.hostname.replace(/^www\./, '');
        const currentHost = req.get('host').replace(/^www\./, '');
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === currentHost) return 'Direct';
        return hostname;
    } catch (e) {
        return 'Direct';
    }
}

module.exports = {
    getOSType,
    getDeviceType,
    getReferrerSource
};
