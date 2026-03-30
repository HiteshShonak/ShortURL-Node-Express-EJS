/* User Controller - Refactored */
const User = require('../models/user');
const { setUser } = require('../service/auth');
const config = require('../config');
const { ERROR_MESSAGES } = require('../config/constants');

const AUTH_COOKIE_OPTIONS = {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: config.cookieSameSite,
    secure: config.cookieSecure,
    path: '/'
};

async function handleUserSignup(req, res) {
    const { name, email, password } = req.body;
    const safeName = typeof name === 'string' ? name.trim() : '';
    const safeEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const safePassword = typeof password === 'string' ? password : '';

    if (!safeName) {
        return res.status(400).json({ error: ERROR_MESSAGES.NAME_REQUIRED });
    }

    if (!safeEmail) {
        return res.status(400).json({ error: ERROR_MESSAGES.EMAIL_REQUIRED });
    }

    if (!safePassword) {
        return res.status(400).json({ error: ERROR_MESSAGES.PASSWORD_REQUIRED });
    }

    if (safePassword.length < 8) {
        return res.status(400).json({ error: ERROR_MESSAGES.PASSWORD_TOO_SHORT });
    }

    try {
        const entry = await User.create({
            name: safeName,
            email: safeEmail,
            password: safePassword
        });

        if (!entry) {
            return res.status(400).json({ error: 'Database failed to create user' });
        }

        const token = setUser(entry);
        res.cookie('uid', token, AUTH_COOKIE_OPTIONS);

        return res.status(201).json({ status: 'success', redirect: '/' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: ERROR_MESSAGES.EMAIL_EXISTS });
        }
        return res.status(400).json({ error: error.message });
    }
}

async function handleUserLogin(req, res) {
    const { email, password } = req.body;
    const safeEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const safePassword = typeof password === 'string' ? password : '';

    if (!safeEmail) {
        return res.status(400).json({ error: ERROR_MESSAGES.EMAIL_REQUIRED });
    }

    if (!safePassword) {
        return res.status(400).json({ error: ERROR_MESSAGES.PASSWORD_REQUIRED });
    }

    try {
        const user = await User.findOne({ email: safeEmail });

        if (!user) {
            return res.status(401).json({ error: ERROR_MESSAGES.INVALID_CREDENTIALS });
        }

        const isMatch = await user.comparePassword(safePassword);

        if (!isMatch) {
            return res.status(401).json({ error: ERROR_MESSAGES.INCORRECT_PASSWORD });
        }

        const token = setUser(user);
        res.cookie('uid', token, AUTH_COOKIE_OPTIONS);

        return res.status(200).json({ status: 'success', redirect: '/' });

    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ error: error.message || ERROR_MESSAGES.INTERNAL_ERROR });
    }
}

async function handleUserLogout(req, res) {
    res.clearCookie('uid', {
        httpOnly: true,
        sameSite: config.cookieSameSite,
        secure: config.cookieSecure,
        path: '/'
    });
    return res.redirect('/');
}

module.exports = {
    handleUserSignup,
    handleUserLogin,
    handleUserLogout
};