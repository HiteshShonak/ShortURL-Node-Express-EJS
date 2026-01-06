const express = require('express');
const {handleGenerateNewShortUrl, handleRedirectToOriginalUrl, handleDeleteURL, handleGetAnalyticsPage} = require('../controllers/url.js');
const { restrictTo } = require('../middleware/auth')

const router = express.Router();

router.post('/', restrictTo(['NORMAL', 'ADMIN']), handleGenerateNewShortUrl);
router.get('/:shortId', handleRedirectToOriginalUrl);
router.get('/analytics/:shortId',restrictTo(['NORMAL', 'ADMIN']), handleGetAnalyticsPage);
router.post('/delete/:shortId',restrictTo(['NORMAL', 'ADMIN']), handleDeleteURL);

module.exports = router;