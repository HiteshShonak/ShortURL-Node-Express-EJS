const { getUser } = require('../service/auth');


//authentication middleware
function checkAuthentication(req, res, next) {
    const tokenFromCookie = req.cookies?.uid;
    req.user = null;

    if (!tokenFromCookie) return next();

    const user = getUser(tokenFromCookie);
    req.user = user || null;
    return next();
}

//authorization middleware
function restrictTo(roles = []) {
    return function(req, res, next) {
        if (!req.user) {
            if (roles.includes('GUEST')) return next();
            return res.redirect('/login');
        }
        
        if (!roles.includes(req.user.role)) {
            return res.redirect('/');
        }

        return next();
    }
}

module.exports = { checkAuthentication, restrictTo };