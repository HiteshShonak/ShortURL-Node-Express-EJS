const express = require('express');
const {restrictTo} = require('../middleware/auth');
const { handleUserSignup, handleUserLogin, handleUserLogout } = require('../controllers/user');

const router = express.Router();

router.post('/', restrictTo(['GUEST']), handleUserSignup);
router.post('/login', restrictTo(['GUEST']), handleUserLogin);
router.get('/logout', restrictTo(['NORMAL', 'ADMIN']), handleUserLogout);

module.exports = router;