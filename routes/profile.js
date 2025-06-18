const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

// Profile page (protected)
router.get('/', isAuthenticated, (req, res) => {
    res.render('profile', { user: req.session.user });
});

module.exports = router; 