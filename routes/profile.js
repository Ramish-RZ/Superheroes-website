const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const superheroController = require('../controllers/superheroController');

// Profile page (protected)
router.get('/', isAuthenticated, superheroController.getProfile);

// Update reason for a favorite
router.post('/favorite/reason', isAuthenticated, superheroController.updateFavoriteReason);

// Favorite/unfavorite from profile
router.post('/favorite/:id', isAuthenticated, superheroController.favoriteSuperhero);

module.exports = router; 