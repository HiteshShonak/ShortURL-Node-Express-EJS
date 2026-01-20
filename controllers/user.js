/* User Controller - Refactored */
const User = require('../models/user');
const { setUser } = require('../service/auth');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../config/constants');

async function handleUserSignup(req, res) {
    const { name, email, password } = req.body;

    try {
        const entry = await User.create({ name, email, password });

        if (!entry) {
            return res.status(400).json({ error: 'Database failed to create user' });
        }

        const token = setUser(entry);
        res.cookie('uid', token);

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

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: ERROR_MESSAGES.INVALID_CREDENTIALS });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ error: ERROR_MESSAGES.INCORRECT_PASSWORD });
        }

        const token = setUser(user);
        res.cookie('uid', token);

        return res.status(200).json({ status: 'success', redirect: '/' });

    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ error: error.message || ERROR_MESSAGES.INTERNAL_ERROR });
    }
}

async function handleUserLogout(req, res) {
    res.clearCookie('uid');
    return res.redirect('/');
}

module.exports = {
    handleUserSignup,
    handleUserLogin,
    handleUserLogout
};