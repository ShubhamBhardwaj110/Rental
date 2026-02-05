const express = require('express');
const router = express.Router({});
const User = require('../models/user.js');
const wrapAsync = require('../utils/wrapAsync.js');
const passport = require('passport');
const { savedRedirectUrl } = require('../middleware.js');
const userControllers = require('../controllers/users.js');

router.route('/signup')
.get((req, res) => {
    res.render('users/signup');})
.post(wrapAsync(userControllers.signup));

router.route('/login')
.get(userControllers.renderLoginForm)
.post(savedRedirectUrl, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), userControllers.login);

router.get('/logout',userControllers.logout);

module.exports = router;