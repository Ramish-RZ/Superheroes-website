const express = require('express');
const router = express.Router();
const superheroController = require('../controllers/superheroController');

// Home page with superheroes
router.get('/', superheroController.getHome);

// Search superheroes
router.get('/search', superheroController.searchSuperheroes);

// Get single superhero
router.get('/:id', superheroController.getSuperhero);

module.exports = router; 