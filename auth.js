const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/User');

// Login route
router.post('/login', passport.authenticate('local', {
    successRedirect: '/posts/dashboard',
    failureRedirect: '/login'
}));

// Register route
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.redirect('/login');
});

// Render login page
router.get('/login', (req, res) => {
    res.render('login');
});

// Render register page
router.get('/register', (req, res) => {
    res.render('register');
});

module.exports = router;