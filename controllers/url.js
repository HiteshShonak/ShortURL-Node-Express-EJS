/* URL Controller - Refactored */
const { nanoid } = require('nanoid');
const URLModel = require('../models/url');
const { STATE_CODE_MAP, COUNTRY_CODE_MAP } = require('../utils/locationMap');
const { maskIP } = require('../utils/geolocation');
const { formatMapData } = require('../utils/formatters');
const { trackVisit } = require('../service/analytics');
const config = require('../config');
const { ERROR_MESSAGES } = require('../config/constants');

// Generate short URL
async function handleGenerateNewShortUrl(req, res) {
    try {
        const body = req.body;
        if (!body || !body.url) {
            return res.status(400).json({ error: ERROR_MESSAGES.URL_REQUIRED });
        }

        let originalUrl = body.url.trim();
        if (!/^https?:\/\//i.test(originalUrl)) {
            originalUrl = 'https://' + originalUrl;
        }

        const shortId = nanoid(config.shortIdLength);

        await URLModel.create({
            shortId: shortId,
            redirectUrl: originalUrl,
            visitHistory: [],
            createdBy: req.user._id
        });

        return res.redirect(`/?generated=${shortId}`);
    } catch (error) {
        console.error('Error generating URL:', error);
        return res.status(500).json({ error: ERROR_MESSAGES.SERVER_ERROR });
    }
}

// Redirect to original URL
async function handleRedirectToOriginalUrl(req, res) {
    const shortId = req.params.shortId;

    const entry = await URLModel.findOne({ shortId }).select('redirectUrl');

    if (!entry) {
        console.log(`❌ [FAIL] ShortID ${shortId} not found in DB`);
        return res.status(404).json({ error: ERROR_MESSAGES.URL_NOT_FOUND });
    }

    res.redirect(entry.redirectUrl);

    trackVisit(shortId, req).catch(err => console.error(`❌ [TRACKING ERROR] ${err.message}`));
}

// Delete URL
async function handleDeleteURL(req, res) {
    const id = req.params.shortId;
    try {
        const deletedEntry = await URLModel.findOneAndDelete({ shortId: id, createdBy: req.user._id });
        if (!deletedEntry) {
            return res.status(403).json({ error: ERROR_MESSAGES.UNAUTHORIZED });
        }
        return res.json({ status: 'success', message: 'Deleted' });
    } catch (error) {
        return res.status(500).json({ error: ERROR_MESSAGES.SERVER_ERROR });
    }
}

// Get analytics page
async function handleGetAnalyticsPage(req, res) {
    try {
        const shortId = req.params.shortId;
        const entry = await URLModel.findOne({ shortId });

        if (!entry) {
            return res.status(404).send(ERROR_MESSAGES.LINK_NOT_FOUND);
        }

        if (entry.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).send(ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
        }

        const history = entry.visitHistory || [];

        const todayStr = new Date().toLocaleDateString('en-IN', { timeZone: config.timezone });
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
            const dateStr = dateObj.toLocaleDateString('en-IN', { timeZone: config.timezone });
            const ip = h.ip || 'Unknown';

            uniqueIPsTotal.add(ip);
            if (dateStr === todayStr) {
                clicksToday++;
                uniqueIPsToday.add(ip);
            }

            if (dateObj >= last30DaysDate) {
                const dateKey = dateObj.toLocaleDateString('en-IN', { timeZone: config.timezone });
                const label = dateObj.toLocaleDateString('en-IN', { timeZone: config.timezone, month: 'short', day: 'numeric' });
                if (!clickTrendMap[dateKey]) {
                    clickTrendMap[dateKey] = { count: 0, label: label, date: dateObj };
                }
                clickTrendMap[dateKey].count++;
            }

            const device = h.device || 'Desktop';
            if (deviceStats[device] !== undefined) {
                deviceStats[device]++;
            } else {
                deviceStats['Desktop']++;
            }

            const os = h.os || 'Unknown';
            osStats[os] = (osStats[os] || 0) + 1;

            const source = h.referrer || 'Direct';
            sourceStats[source] = (sourceStats[source] || 0) + 1;

            const hourIST = parseInt(dateObj.toLocaleTimeString('en-IN', {
                timeZone: config.timezone,
                hour: 'numeric',
                hour12: false
            }));

            if (!isNaN(hourIST) && hourIST >= 0 && hourIST < 24) {
                hourlyStats[hourIST]++;
                if (ip !== 'Unknown') hourlyUniqueIPs[hourIST].add(ip);
            }

            if (h.location && h.location !== 'Unknown') {
                const parts = h.location.split(',').map(s => s.trim());
                const city = parts[0] || 'Unknown';
                const country = COUNTRY_CODE_MAP[parts[1]] || parts[1] || 'Unknown';

                if (!cityData[city]) cityData[city] = { total: 0, ips: new Set() };
                cityData[city].total++;
                cityData[city].ips.add(ip);

                if (!countryData[country]) countryData[country] = { total: 0, ips: new Set() };
                countryData[country].total++;
                countryData[country].ips.add(ip);
            }

            if (h.region && h.region !== 'Unknown') {
                const regionName = STATE_CODE_MAP[h.region] || h.region;
                if (!stateData[regionName]) stateData[regionName] = { total: 0, ips: new Set() };
                stateData[regionName].total++;
                stateData[regionName].ips.add(ip);
            }

            if (h.latitude && h.longitude) {
                const key = `${h.latitude},${h.longitude}`;
                if (!locationHeatmap[key]) {
                    locationHeatmap[key] = {
                        total: 0,
                        uniqueIPs: new Set(),
                        loc: h.location || 'Unknown',
                        lat: h.latitude,
                        lng: h.longitude
                    };
                }
                locationHeatmap[key].total++;
                locationHeatmap[key].uniqueIPs.add(ip);
            }
        }

        const sortedTrend = Object.values(clickTrendMap).sort((a, b) => a.date - b.date);
        const topSources = Object.entries(sourceStats).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const hourlyUnique = hourlyUniqueIPs.map(set => set.size);

        const maxTotal = Math.max(...Object.values(locationHeatmap).map(d => d.total), 1);
        const maxUnique = Math.max(...Object.values(locationHeatmap).map(d => d.uniqueIPs.size), 1);
        const heatmapPoints = Object.values(locationHeatmap).map(d => ({
            lat: d.lat,
            lng: d.lng,
            location: d.loc,
            totalClicks: d.total,
            uniqueVisitors: d.uniqueIPs.size,
            intensityTotal: d.total / maxTotal,
            intensityUnique: d.uniqueIPs.size / maxUnique
        }));

        const recentActivity = history.slice(-50).reverse().map(h => ({
            timestamp: new Date(h.timestamp).toLocaleString('en-IN', {
                timeZone: config.timezone,
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }),
            location: h.location || 'Unknown',
            referrer: h.referrer || 'Direct',
            device: h.device || 'Desktop',
            os: h.os || 'Unknown',
            ip: maskIP(h.ip)
        }));

        return res.render('analytics', {
            page: 'analytics',
            shortId,
            redirectUrl: entry.redirectUrl,
            totalClicks: history.length,
            uniqueTotal: uniqueIPsTotal.size,
            clicksToday,
            uniqueToday: uniqueIPsToday.size,
            trendLabels: JSON.stringify(sortedTrend.map(t => t.label)),
            trendData: JSON.stringify(sortedTrend.map(t => t.count)),
            deviceStats: JSON.stringify([deviceStats.Desktop, deviceStats.Mobile, deviceStats.Tablet, deviceStats.Bot]),
            osStats: JSON.stringify(osStats),
            hourlyStats: JSON.stringify(hourlyStats),
            hourlyUnique: JSON.stringify(hourlyUnique),
            sourceLabels: JSON.stringify(topSources.map(s => s[0])),
            sourceData: JSON.stringify(topSources.map(s => s[1])),
            topCities: JSON.stringify(formatMapData(cityData)),
            topStates: JSON.stringify(formatMapData(stateData)),
            topCountries: JSON.stringify(formatMapData(countryData)),
            heatmapPoints: JSON.stringify(heatmapPoints),
            maxTotalClicks: maxTotal,
            maxUniqueVisitors: maxUnique,
            recentActivity
        });

    } catch (err) {
        console.error('Analytics Page Error:', err);
        res.status(500).send(ERROR_MESSAGES.INTERNAL_ERROR);
    }
}

module.exports = {
    handleGenerateNewShortUrl,
    handleRedirectToOriginalUrl,
    handleDeleteURL,
    handleGetAnalyticsPage
};