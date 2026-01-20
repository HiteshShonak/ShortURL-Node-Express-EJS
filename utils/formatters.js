/*Data formatting utilities */

function formatMapData(dataObj) {
    return Object.entries(dataObj)
        .map(([name, d]) => ({
            name,
            total: d.total,
            unique: d.ips.size
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
}

module.exports = {
    formatMapData
};
