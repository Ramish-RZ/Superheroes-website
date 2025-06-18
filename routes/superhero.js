const express = require('express');
const router = express.Router();
const superheroController = require('../controllers/superheroController');

// Home page with superheroes
router.get('/', superheroController.getHome);

// Search superheroes
router.get('/search', superheroController.searchSuperheroes);

// Get user's favorites
router.get('/favorites', superheroController.getFavorites);

// Get single superhero
router.get('/:id', superheroController.getSuperhero);

// Favorite superhero
router.post('/:id/favorite', superheroController.favoriteSuperhero);

module.exports = router; 