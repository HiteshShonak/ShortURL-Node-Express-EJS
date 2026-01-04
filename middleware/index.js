const fs = require("fs");

function logReqRes(filename){
    return (req, res, next) => {
        const logEntry = `[${new Date().toISOString()}] - ${req.method} - ${req.url} - ${req.ip} - ${req.path}\n`;
        fs.appendFile(filename, logEntry, (err) => {
            if (err) {
                console.error("Failed to write to log file", err);
            }
        });
        next();
    }
}

module.exports = {logReqRes};