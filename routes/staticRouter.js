const express = require('express');
const URL = require('../models/url');
const { restrictTo} = require('../middleware/auth');
const { getUser } = require("../service/auth");
const router = express.Router();


router.get('/', async (req, res) => {
    if (!req.user) {
        return res.render('home', { urls: [], id: null });
    }

    else{
    const allUrls = await URL.find({createdBy: req.user._id});
    const generatedId = req.query.generated;
    res.render('home', {page: 'home', urls: allUrls, id: generatedId });
    }
    
});

router.get('/admin', restrictTo(['ADMIN']), async (req, res) => {
    if (!req.user) {
        return res.render('home', { urls: [], id: null });
    }

    else{
    const allUrls = await URL.find({}).populate("createdBy");
    const generatedId = req.query.generated;
    res.render('home', { urls: allUrls, id: generatedId, user: req.user, isAdmin: true });
    }
    
});

router.get('/dashboard', (req, res) => {
    const userUid = req.cookies?.uid;
    const currentUser = getUser(userUid);

    res.render('dashboard', { 
        page: 'dashboard',
        user: currentUser 
    });
});

router.get('/signup', restrictTo(['GUEST']), (req, res) => {
    res.render('signup');
});

router.get('/login', restrictTo(['GUEST']), (req, res) => {
    res.render('login', { error: null });
});


router.get('/about', (req, res) => {
    res.render('about', { page: 'about',
        user: req.user || null
    });
});





module.exports = router;