const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isNotAuthenticated } = require('../middleware/auth');

// Login routes
router.get('/login', isNotAuthenticated, authController.getLogin);
router.post('/login', isNotAuthenticated, authController.postLogin);

// Registration routes
router.get('/register', isNotAuthenticated, authController.getRegister);
router.post('/register', isNotAuthenticated, authController.postRegister);

// Logout route
router.get('/logout', authController.logout);

module.exports = router; 