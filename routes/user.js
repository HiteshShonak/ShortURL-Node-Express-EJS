const express = require('express');
const {restrictTo} = require('../middleware/auth');
const { handleUserSignup, handleUserLogin, handleUserLogout } = require('../controllers/user');
const { authLimiter } = require('../middleware/security');

const router = express.Router();

router.post('/', authLimiter, restrictTo(['GUEST']), handleUserSignup);
router.post('/login', authLimiter, restrictTo(['GUEST']), handleUserLogin);
router.get('/logout', restrictTo(['NORMAL', 'ADMIN']), handleUserLogout);

module.exports = router;