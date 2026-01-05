const {nanoid} = require('nanoid');
const URLModel = require('../models/url');
const userAgent = require('user-agent');
const requestIp = require('request-ip');
const geoip = require('geoip-lite');

async function handleGenerateNewShortUrl(req, res) {
    const shortId = nanoid(8);
    const body = req.body;
    if (!body || !body.url) {
        return res.status(400).json({ error: 'URL is required' });
    }
    const { url } = req.body;
    const allUrls = await URLModel.find({});

    await URLModel.create({ 
        shortId: shortId, 
        redirectUrl: url,
        visitHistory: [],
        createdBy: req.user._id
    });
    return res.redirect(`/?generated=${shortId}`);
}

async function handleRedirectToOriginalUrl(req, res) {
    const shortId = req.params.shortId;

    const entry = await URLModel.findOne({ shortId });

    if (!entry) {
        return res.status(404).json({ error: 'Short URL not found' });
    }

    res.redirect(entry.redirectUrl);

    trackVisit(shortId, req).catch(err => {
        console.error(`Analytics error for ${shortId}:`, err);
    });
}

async function trackVisit(shortId, req) {
    const userIp = getClientIP(req);  
    const geoData = getGeolocation(userIp);
    
    await URLModel.findOneAndUpdate(
        { shortId },
        {
            $push: {
                visitHistory: {
                    timestamp: Date.now(),
                    device: getDeviceType(req.headers['user-agent']),
                    ip: userIp,  
                    location: geoData.location,
                    referrer: getReferrerSource(req),
                    latitude: geoData.latitude,
                    longitude: geoData.longitude,
                    region: geoData.region
                }
            }
        }
    );
}

function getClientIP(req) {
    let ip = requestIp.getClientIp(req);
    
    // Clean IPv6 localhost format
    if (ip && ip.startsWith('::ffff:')) {
        ip = ip.replace('::ffff:', '');
    }
    
    //For testing purposes, convert localhost to a fixed IP (Delhi)
    if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
        console.log(`🧪 Converting localhost to Delhi IP`);
        return '103.240.232.0';  // Delhi IP
    }
    
    return ip;
}

function getDeviceType(userAgentString) {
    const ua = userAgent.parse(userAgentString);
    if (ua.isBot) return 'Bot';
    if (ua.isTablet) return 'Tablet';
    if (ua.isMobile) return 'Mobile';
    return 'Desktop';
}

function getGeolocation(ip) {
    const geo = geoip.lookup(ip);
    
    if (!geo) {
        return {
            location: 'Unknown',
            latitude: 0,
            longitude: 0,
            region: 'Unknown'
        };
    }
    
    const city = geo.city || 'Unknown';
    const country = geo.country || 'Unknown';
    const latitude = geo.ll?.[0] || 0;
    const longitude = geo.ll?.[1] || 0;
    const region = geo.region || 'Unknown';
    
    let location = 'Unknown';
    if (city !== 'Unknown' && country !== 'Unknown') {
        location = `${city}, ${country}`;
    } else if (city !== 'Unknown') {
        location = city;
    } else if (country !== 'Unknown') {
        location = country;
    }
    
    return {
        location,
        latitude,
        longitude,
        region
    };
}


function getReferrerSource(req) {
    const manualSource = req.query.source || req.query.utm_source;
    if (manualSource) return manualSource;

    const referrerHeader = req.headers['referer'] || req.headers['referrer'];
    
    if (!referrerHeader) {
        return 'Direct';
    }

    try {
        const hostname = new URL(referrerHeader).hostname.replace('www.', '');
        const currentHost = req.get('host').replace('www.', '');
        
        // ✅ Localhost or self-referral = Direct
        if (hostname === 'localhost' || 
            hostname === '127.0.0.1' || 
            hostname === currentHost) {
            return 'Direct';
        }
        
        return hostname;
    } catch (e) {
        return 'Direct';
    }
}

//Mask IP for privacy display
function maskIP(ip) {
    if (!ip || ip === 'Unknown') return 'Unknown';
    
    // IPv4: 103.240.232.15 → 103.240.xx.xx
    if (ip.includes('.')) {
        const parts = ip.split('.');
        if (parts.length === 4) {
            return `${parts[0]}.${parts[1]}.xx.xx`;
        }
    }
    
    // IPv6: 2001:0db8:85a3::8a2e → 2001:0db8:xx:xx
    if (ip.includes(':')) {
        const parts = ip.split(':');
        if (parts.length >= 2) {
            return `${parts[0]}:${parts[1]}:xx:xx`;
        }
    }
    
    return 'xx.xx.xx.xx';
}

async function handleDeleteURL(req, res) {
    const id = req.params.shortId;

    try {
        const deletedEntry = await URLModel.findOneAndDelete({ 
            shortId: id, 
            createdBy: req.user._id
        });

        if (!deletedEntry) {
            return res.status(403).json({ 
                error: "Unauthorized: You can only delete your own links." 
            });
        }

        return res.json({ status: "success", message: "Link deleted successfully." });

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

async function handleGetAnalyticsPage(req, res) {
    const shortId = req.params.shortId;
    const entry = await URLModel.findOne({ shortId });

    

    if (!entry || entry.createdBy.toString() !== req.user._id.toString()) {
        if(req.user.role === 'ADMIN'){
            // Allow ADMIN users to access analytics of any URL
        }
        else{
            return res.status(403).send("Unauthorized");
        }
        
    }

    const history = entry.visitHistory || [];
    const totalClicks = history.length;
    
    const uniqueTotal = new Set(history.map(h => h.ip)).size;

    const todayStr = new Date().toLocaleDateString();
    const historyToday = history.filter(h => 
        new Date(h.timestamp).toLocaleDateString() === todayStr
    );
    const clicksToday = historyToday.length;
    const uniqueToday = new Set(historyToday.map(h => h.ip)).size;

    const clickTrend = {};
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    history.forEach(entry => {
        if (entry.timestamp) {
            const dateObj = new Date(entry.timestamp);
            if (dateObj >= last30Days) {
                const dateKey = dateObj.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'numeric', 
                    day: 'numeric' 
                });
                const label = dateObj.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                });
                
                if (!clickTrend[dateKey]) {
                    clickTrend[dateKey] = { count: 0, label: label, date: dateObj };
                }
                clickTrend[dateKey].count++;
            }
        }
    });

    const sortedDates = Object.keys(clickTrend)
        .sort((a, b) => clickTrend[a].date - clickTrend[b].date);
    
    const trendLabels = sortedDates.map(k => clickTrend[k].label);
    const trendData = sortedDates.map(k => clickTrend[k].count);

    const deviceStats = { Desktop: 0, Mobile: 0, Tablet: 0, Bot: 0 };
    history.forEach(entry => {
        const device = entry.device || 'Desktop';
        deviceStats[device] = (deviceStats[device] || 0) + 1;
    });

    const sourceStats = {};
    history.forEach(entry => {
        const source = entry.referrer || 'Direct';
        sourceStats[source] = (sourceStats[source] || 0) + 1;
    });

    const topSources = Object.entries(sourceStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const hourlyStats = Array(24).fill(0);
    const hourlyUniqueIPs = Array(24).fill(null).map(() => new Set());
    
    history.forEach(entry => {
        if (entry.timestamp && entry.ip) {
            const hour = new Date(entry.timestamp).getHours();
            hourlyStats[hour]++;
            hourlyUniqueIPs[hour].add(entry.ip);
        }
    });
    
    const hourlyUnique = hourlyUniqueIPs.map(set => set.size);

    const cityData = {};
    const stateData = {};
    const countryData = {};

    const stateCodeMap = {
        'AN': 'Andaman and Nicobar', 'AP': 'Andhra Pradesh', 'AR': 'Arunachal Pradesh',
        'AS': 'Assam', 'BR': 'Bihar', 'CH': 'Chandigarh', 'CT': 'Chhattisgarh',
        'DD': 'Daman and Diu', 'DL': 'Delhi', 'DN': 'Dadra and Nagar Haveli',
        'GA': 'Goa', 'GJ': 'Gujarat', 'HP': 'Himachal Pradesh', 'HR': 'Haryana',
        'JH': 'Jharkhand', 'JK': 'Jammu and Kashmir', 'KA': 'Karnataka',
        'KL': 'Kerala', 'LA': 'Ladakh', 'LD': 'Lakshadweep', 'MH': 'Maharashtra',
        'ML': 'Meghalaya', 'MN': 'Manipur', 'MP': 'Madhya Pradesh', 'MZ': 'Mizoram',
        'NL': 'Nagaland', 'OR': 'Odisha', 'PB': 'Punjab', 'PY': 'Puducherry',
        'RJ': 'Rajasthan', 'SK': 'Sikkim', 'TN': 'Tamil Nadu', 'TG': 'Telangana',
        'TR': 'Tripura', 'UP': 'Uttar Pradesh', 'UT': 'Uttarakhand', 'WB': 'West Bengal',
        'CA': 'California', 'NY': 'New York', 'TX': 'Texas', 'FL': 'Florida',
        'IL': 'Illinois', 'PA': 'Pennsylvania', 'OH': 'Ohio',
        'ENG': 'England', 'SCT': 'Scotland', 'WLS': 'Wales', 'NIR': 'Northern Ireland'
    };

    const countryCodeMap = {
        'IN': 'India', 'CN': 'China', 'JP': 'Japan', 'KR': 'South Korea',
        'PK': 'Pakistan', 'BD': 'Bangladesh', 'ID': 'Indonesia', 'TH': 'Thailand',
        'VN': 'Vietnam', 'PH': 'Philippines', 'MY': 'Malaysia', 'SG': 'Singapore',
        'MM': 'Myanmar', 'KH': 'Cambodia', 'LK': 'Sri Lanka', 'NP': 'Nepal',
        'AF': 'Afghanistan', 'IQ': 'Iraq', 'IR': 'Iran', 'SA': 'Saudi Arabia',
        'AE': 'United Arab Emirates', 'IL': 'Israel', 'TR': 'Turkey', 'KZ': 'Kazakhstan',
        'GB': 'United Kingdom', 'DE': 'Germany', 'FR': 'France', 'IT': 'Italy',
        'ES': 'Spain', 'NL': 'Netherlands', 'BE': 'Belgium', 'CH': 'Switzerland',
        'AT': 'Austria', 'SE': 'Sweden', 'NO': 'Norway', 'DK': 'Denmark',
        'FI': 'Finland', 'PL': 'Poland', 'RU': 'Russia', 'UA': 'Ukraine',
        'RO': 'Romania', 'GR': 'Greece', 'PT': 'Portugal', 'CZ': 'Czech Republic',
        'HU': 'Hungary', 'IE': 'Ireland', 'SK': 'Slovakia', 'BG': 'Bulgaria',
        'US': 'United States', 'CA': 'Canada', 'MX': 'Mexico',
        'BR': 'Brazil', 'AR': 'Argentina', 'CO': 'Colombia', 'PE': 'Peru',
        'VE': 'Venezuela', 'CL': 'Chile', 'EC': 'Ecuador', 'BO': 'Bolivia',
        'ZA': 'South Africa', 'NG': 'Nigeria', 'EG': 'Egypt', 'KE': 'Kenya',
        'ET': 'Ethiopia', 'GH': 'Ghana', 'TZ': 'Tanzania', 'UG': 'Uganda',
        'DZ': 'Algeria', 'MA': 'Morocco', 'SD': 'Sudan',
        'AU': 'Australia', 'NZ': 'New Zealand', 'FJ': 'Fiji', 'PG': 'Papua New Guinea',
        'JM': 'Jamaica', 'TT': 'Trinidad and Tobago', 'CR': 'Costa Rica',
        'PA': 'Panama', 'GT': 'Guatemala', 'HN': 'Honduras',
        'JO': 'Jordan', 'LB': 'Lebanon', 'SY': 'Syria', 'YE': 'Yemen',
        'OM': 'Oman', 'KW': 'Kuwait', 'QA': 'Qatar', 'BH': 'Bahrain'
    };

    history.forEach(entry => {
        if (entry.location && entry.location !== 'Unknown') {
            const parts = entry.location.split(',').map(s => s.trim());
            const city = parts[0] || 'Unknown';
            const countryCode = parts[1] || 'Unknown';
            const country = countryCodeMap[countryCode] || countryCode;

            if (!cityData[city]) {
                cityData[city] = { total: 0, ips: new Set() };
            }
            cityData[city].total++;
            if (entry.ip) cityData[city].ips.add(entry.ip);

            if (!countryData[country]) {
                countryData[country] = { total: 0, ips: new Set() };
            }
            countryData[country].total++;
            if (entry.ip) countryData[country].ips.add(entry.ip);
        }

        if (entry.region && entry.region !== 'Unknown') {
            const regionName = stateCodeMap[entry.region] || entry.region;
            if (!stateData[regionName]) {
                stateData[regionName] = { total: 0, ips: new Set() };
            }
            stateData[regionName].total++;
            if (entry.ip) stateData[regionName].ips.add(entry.ip);
        }
    });

    const topCities = Object.entries(cityData)
        .map(([name, data]) => ({
            name,
            total: data.total,
            unique: data.ips.size
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
    
    const topStates = Object.entries(stateData)
        .map(([name, data]) => ({
            name,
            total: data.total,
            unique: data.ips.size
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
    
    const topCountries = Object.entries(countryData)
        .map(([name, data]) => ({
            name,
            total: data.total,
            unique: data.ips.size
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

    const heatmapPoints = [];
    const locationData = {};

    history.forEach(entry => {
        if (entry.latitude && entry.longitude) {
            const key = `${entry.latitude},${entry.longitude}`;
            
            if (!locationData[key]) {
                locationData[key] = {
                    totalClicks: 0,
                    uniqueIPs: new Set(),
                    location: entry.location || 'Unknown',
                    lat: entry.latitude,
                    lng: entry.longitude
                };
            }
            
            locationData[key].totalClicks++;
            if (entry.ip) {
                locationData[key].uniqueIPs.add(entry.ip);
            }
        }
    });

    const maxTotal = Math.max(...Object.values(locationData).map(d => d.totalClicks), 1);
    const maxUnique = Math.max(...Object.values(locationData).map(d => d.uniqueIPs.size), 1);

    Object.values(locationData).forEach(data => {
        heatmapPoints.push({
            lat: data.lat,
            lng: data.lng,
            location: data.location,
            totalClicks: data.totalClicks,
            uniqueVisitors: data.uniqueIPs.size,
            intensityTotal: data.totalClicks / maxTotal,
            intensityUnique: data.uniqueIPs.size / maxUnique
        });
    });

    //MASKED IP in Recent Activity
    const recentActivity = history
        .slice(-50)
        .reverse()
        .map(entry => ({
            timestamp: entry.timestamp,
            location: entry.location || 'Unknown',
            referrer: entry.referrer || 'Direct',
            device: entry.device || 'Desktop',
            ip: maskIP(entry.ip)  // ✅ MASKED
        }));

    return res.render("analytics", {
        page: 'analytics',
        shortId,
        redirectUrl: entry.redirectUrl,
        totalClicks,
        uniqueTotal,
        clicksToday,
        uniqueToday,
        trendLabels: JSON.stringify(trendLabels),
        trendData: JSON.stringify(trendData),
        deviceStats: JSON.stringify([
            deviceStats.Desktop, 
            deviceStats.Mobile, 
            deviceStats.Tablet, 
            deviceStats.Bot
        ]),
        hourlyStats: JSON.stringify(hourlyStats),
        hourlyUnique: JSON.stringify(hourlyUnique),
        sourceLabels: JSON.stringify(topSources.map(s => s[0])),
        sourceData: JSON.stringify(topSources.map(s => s[1])),
        topCities: JSON.stringify(topCities),
        topStates: JSON.stringify(topStates),
        topCountries: JSON.stringify(topCountries),
        heatmapPoints: JSON.stringify(heatmapPoints),
        maxTotalClicks: maxTotal,  
        maxUniqueVisitors: maxUnique, 
        recentActivity
    });
}

module.exports = { 
    handleGenerateNewShortUrl,
    handleRedirectToOriginalUrl,
    handleDeleteURL,
    handleGetAnalyticsPage,
};
