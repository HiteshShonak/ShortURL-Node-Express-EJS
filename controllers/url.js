const { nanoid } = require('nanoid');
const URLModel = require('../models/url');
const requestIp = require('request-ip');
const axios = require('axios'); 
const { STATE_CODE_MAP, COUNTRY_CODE_MAP } = require('../utils/locationMap');

async function handleGenerateNewShortUrl(req, res) {
    try {
        const body = req.body;
        if (!body || !body.url) return res.status(400).json({ error: 'URL is required' });

        let originalUrl = body.url.trim();
        if (!/^https?:\/\//i.test(originalUrl)) originalUrl = 'https://' + originalUrl;

        const shortId = nanoid(8);
        
        await URLModel.create({ 
            shortId: shortId, 
            redirectUrl: originalUrl, 
            visitHistory: [], 
            createdBy: req.user._id 
        });

        return res.redirect(`/?generated=${shortId}`);
    } catch (error) {
        console.error("Error generating URL:", error);
        return res.status(500).json({ error: "Server Error" });
    }
}

async function handleRedirectToOriginalUrl(req, res) {
    const shortId = req.params.shortId;
    

    const entry = await URLModel.findOne({ shortId }).select('redirectUrl');

    if (!entry) {
        console.log(`❌ [FAIL] ShortID ${shortId} not found in DB`);
        return res.status(404).json({ error: 'Short URL not found' });
    }

    res.redirect(entry.redirectUrl);

    trackVisit(shortId, req).catch(err => console.error(`❌ [TRACKING ERROR] ${err.message}`));
}

async function handleDeleteURL(req, res) {
    const id = req.params.shortId;
    try {
        const deletedEntry = await URLModel.findOneAndDelete({ shortId: id, createdBy: req.user._id });
        if (!deletedEntry) return res.status(403).json({ error: "Unauthorized" });
        return res.json({ status: "success", message: "Deleted" });
    } catch (error) {
        return res.status(500).json({ error: "Server Error" });
    }
}

async function handleGetAnalyticsPage(req, res) {
    try {
        const shortId = req.params.shortId;
        const entry = await URLModel.findOne({ shortId });

        if (!entry) return res.status(404).send("Link not found");
        if (entry.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).send("Unauthorized Access");
        }

        const history = entry.visitHistory || [];
        
        const todayStr = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
        const last30DaysDate = new Date();
        last30DaysDate.setDate(last30DaysDate.getDate() - 30);

        let clicksToday = 0;
        const uniqueIPsTotal = new Set();
        const uniqueIPsToday = new Set();
        
        const clickTrendMap = {}; 
        const deviceStats = { Desktop: 0, Mobile: 0, Tablet: 0, Bot: 0 };
        const osStats = {}; 
        const sourceStats = {};
        const cityData = {};
        const stateData = {};
        const countryData = {};
        const hourlyStats = Array(24).fill(0);
        const hourlyUniqueIPs = Array(24).fill(null).map(() => new Set());
        const locationHeatmap = {};

        for (const h of history) {
            if (!h.timestamp) continue;
            const dateObj = new Date(h.timestamp);
            const dateStr = dateObj.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
            const ip = h.ip || 'Unknown';

            uniqueIPsTotal.add(ip);
            if (dateStr === todayStr) { clicksToday++; uniqueIPsToday.add(ip); }

            if (dateObj >= last30DaysDate) {
                const dateKey = dateObj.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
                const label = dateObj.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric' });
                if (!clickTrendMap[dateKey]) clickTrendMap[dateKey] = { count: 0, label: label, date: dateObj };
                clickTrendMap[dateKey].count++;
            }

            const device = h.device || 'Desktop';
            if (deviceStats[device] !== undefined) deviceStats[device]++; else deviceStats['Desktop']++;

            const os = h.os || 'Unknown';
            osStats[os] = (osStats[os] || 0) + 1;

            const source = h.referrer || 'Direct';
            sourceStats[source] = (sourceStats[source] || 0) + 1;

            const hourIST = parseInt(dateObj.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false }));
            if (!isNaN(hourIST) && hourIST >= 0 && hourIST < 24) {
                hourlyStats[hourIST]++;
                if (ip !== 'Unknown') hourlyUniqueIPs[hourIST].add(ip);
            }

            if (h.location && h.location !== 'Unknown') {
                const parts = h.location.split(',').map(s => s.trim());
                const city = parts[0] || 'Unknown';
                const country = COUNTRY_CODE_MAP[parts[1]] || parts[1] || 'Unknown';
                if (!cityData[city]) cityData[city] = { total: 0, ips: new Set() };
                cityData[city].total++; cityData[city].ips.add(ip);
                if (!countryData[country]) countryData[country] = { total: 0, ips: new Set() };
                countryData[country].total++; countryData[country].ips.add(ip);
            }
            if (h.region && h.region !== 'Unknown') {
                const regionName = STATE_CODE_MAP[h.region] || h.region;
                if (!stateData[regionName]) stateData[regionName] = { total: 0, ips: new Set() };
                stateData[regionName].total++; stateData[regionName].ips.add(ip);
            }
            if (h.latitude && h.longitude) {
                const key = `${h.latitude},${h.longitude}`;
                if (!locationHeatmap[key]) locationHeatmap[key] = { total: 0, uniqueIPs: new Set(), loc: h.location || 'Unknown', lat: h.latitude, lng: h.longitude };
                locationHeatmap[key].total++; locationHeatmap[key].uniqueIPs.add(ip);
            }
        }

        const sortedTrend = Object.values(clickTrendMap).sort((a, b) => a.date - b.date);
        const topSources = Object.entries(sourceStats).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const formatMapData = (dataObj) => Object.entries(dataObj).map(([name, d]) => ({ name, total: d.total, unique: d.ips.size })).sort((a, b) => b.total - a.total).slice(0, 10);
        
        const hourlyUnique = hourlyUniqueIPs.map(set => set.size);

        const maxTotal = Math.max(...Object.values(locationHeatmap).map(d => d.total), 1);
        const maxUnique = Math.max(...Object.values(locationHeatmap).map(d => d.uniqueIPs.size), 1);
        const heatmapPoints = Object.values(locationHeatmap).map(d => ({
            lat: d.lat, lng: d.lng, location: d.loc, totalClicks: d.total, uniqueVisitors: d.uniqueIPs.size,
            intensityTotal: d.total / maxTotal, intensityUnique: d.uniqueIPs.size / maxUnique
        }));

        const recentActivity = history.slice(-50).reverse().map(h => ({
            timestamp: new Date(h.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
            location: h.location || 'Unknown', referrer: h.referrer || 'Direct',
            device: h.device || 'Desktop', os: h.os || 'Unknown', ip: maskIP(h.ip)
        }));

        return res.render("analytics", {
            page: 'analytics', shortId, redirectUrl: entry.redirectUrl,
            totalClicks: history.length, uniqueTotal: uniqueIPsTotal.size, clicksToday, uniqueToday: uniqueIPsToday.size,
            trendLabels: JSON.stringify(sortedTrend.map(t => t.label)), trendData: JSON.stringify(sortedTrend.map(t => t.count)),
            deviceStats: JSON.stringify([deviceStats.Desktop, deviceStats.Mobile, deviceStats.Tablet, deviceStats.Bot]),
            osStats: JSON.stringify(osStats),
            hourlyStats: JSON.stringify(hourlyStats), hourlyUnique: JSON.stringify(hourlyUnique),
            sourceLabels: JSON.stringify(topSources.map(s => s[0])), sourceData: JSON.stringify(topSources.map(s => s[1])),
            topCities: JSON.stringify(formatMapData(cityData)), topStates: JSON.stringify(formatMapData(stateData)),
            topCountries: JSON.stringify(formatMapData(countryData)), heatmapPoints: JSON.stringify(heatmapPoints),
            maxTotalClicks: maxTotal, maxUniqueVisitors: maxUnique, recentActivity
        });

    } catch (err) {
        console.error("Analytics Page Error:", err);
        res.status(500).send("Internal Server Error");
    }
}


async function trackVisit(shortId, req) {
    const userAgentString = req.headers['user-agent'] || '';
    
    const deviceType = getDeviceType(userAgentString);
    if (deviceType === 'Bot') {
        console.log("🤖 Bot detected, skipping track.");
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

function getClientIP(req) {
    const xForwardedFor = req.headers['x-forwarded-for'];
    let ip = xForwardedFor ? xForwardedFor.split(',')[0].trim() : (req.connection.remoteAddress || req.socket.remoteAddress || requestIp.getClientIp(req));
    if (ip && ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');
    
    if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') return '127.0.0.1'; 
    
    return ip;
}

async function getGeolocation(ip) {
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
        const region = data.region || 'Unknown';
        const country = data.countryCode || 'Unknown';

        let location = 'Unknown';
        if (city !== 'Unknown' && region !== 'Unknown') {
            location = `${city}, ${region}`; 
        } else {
            location = data.country || 'Unknown';
        }
        
        return { 
            location, 
            latitude: data.lat || 0, 
            longitude: data.lon || 0, 
            region: region 
        };

    } catch (error) {
        console.error("Geo API Error:", error.message);
        return { location: 'Unknown', latitude: 0, longitude: 0, region: 'Unknown' };
    }
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
    } catch (e) { return 'Direct'; }
}

function maskIP(ip) {
    if (!ip || ip === 'Unknown') return 'Unknown';
    if (ip.includes('.')) { 
        const parts = ip.split('.');
        if (parts.length === 4) return `${parts[0]}.${parts[1]}.xx.xx`;
    }
    if (ip.includes(':')) { 
        const parts = ip.split(':');
        if (parts.length >= 2) return `${parts[0]}:${parts[1]}:xx:xx`;
    }
    return 'xx.xx.xx.xx';
}

module.exports = { 
    handleGenerateNewShortUrl,
    handleRedirectToOriginalUrl,
    handleDeleteURL,
    handleGetAnalyticsPage,
};