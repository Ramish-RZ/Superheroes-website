const Superhero = require('../models/Superhero');
const superheroApi = require('../services/superheroApi');
const User = require('../models/User');

// Get home page with superheroes
exports.getHome = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;

        // Get superheroes from database
        let superheroes = await Superhero.find()
            .skip(skip)
            .limit(limit)
            .sort({ name: 1 });

        // If no superheroes in database, fetch from API
        if (superheroes.length === 0) {
            try {
                const apiSuperheroes = await superheroApi.getRandomSuperheroes(limit);
                
                // Save to database
                superheroes = await Promise.all(
                    apiSuperheroes.map(async (hero) => {
                        const superhero = new Superhero({
                            apiId: hero.id,
                            name: hero.name,
                            image: hero.image.url,
                            powerstats: hero.powerstats,
                            biography: hero.biography,
                            appearance: hero.appearance,
                            work: hero.work,
                            connections: hero.connections
                        });
                        return superhero.save();
                    })
                );
            } catch (apiError) {
                console.error('Error fetching from API:', apiError);
                return res.render('index', {
                    title: 'Home',
                    superheroes: [],
                    messages: { error: 'Error fetching superheroes from API. Please try again later.' }
                });
            }
        }

        // Get total count for pagination
        const total = await Superhero.countDocuments();
        const totalPages = Math.ceil(total / limit);

        res.render('index', {
            title: 'Home',
            superheroes,
            pagination: {
                currentPage: page,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Error in getHome:', error);
        res.render('index', {
            title: 'Home',
            superheroes: [],
            messages: { error: 'Error loading superheroes. Please try again later.' }
        });
    }
};

// Get single superhero
exports.getSuperhero = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Try to get from database first
        let superhero = await Superhero.findOne({ apiId: id });

        // If not in database, fetch from API and save
        if (!superhero) {
            const apiHero = await superheroApi.getSuperhero(id);
            superhero = new Superhero({
                apiId: apiHero.id,
                name: apiHero.name,
                image: apiHero.image.url,
                powerstats: apiHero.powerstats,
                biography: apiHero.biography,
                appearance: apiHero.appearance,
                work: apiHero.work,
                connections: apiHero.connections
            });
            await superhero.save();
        }

        res.render('superhero', {
            title: superhero.name,
            superhero
        });
    } catch (error) {
        console.error('Error in getSuperhero:', error);
        res.status(404).render('error', {
            title: 'Error',
            message: 'Superhero not found'
        });
    }
};

// Search superheroes
exports.searchSuperheroes = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.redirect('/');
        }

        // Search in database first
        let superheroes = await Superhero.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { 'biography.fullName': { $regex: q, $options: 'i' } }
            ]
        }).limit(20);

        // If no results in database, search API
        if (superheroes.length === 0) {
            const apiResults = await superheroApi.searchSuperheroes(q);
            
            // Save to database
            superheroes = await Promise.all(
                apiResults.map(async (hero) => {
                    const superhero = new Superhero({
                        apiId: hero.id,
                        name: hero.name,
                        image: hero.image.url,
                        powerstats: hero.powerstats,
                        biography: hero.biography,
                        appearance: hero.appearance,
                        work: hero.work,
                        connections: hero.connections
                    });
                    return superhero.save();
                })
            );
        }

        res.render('index', {
            title: 'Search Results',
            superheroes,
            query: q,
            pagination: {
                currentPage: 1,
                totalPages: 1
            }
        });
    } catch (error) {
        console.error('Error in searchSuperheroes:', error);
        res.render('index', {
            title: 'Search Results',
            superheroes: [],
            query: req.query.q,
            messages: { error: 'Error searching superheroes' }
        });
    }
};

// Favorite superhero
exports.favoriteSuperhero = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Please log in to favorite superheroes');
    }
    try {
        const userId = req.session.user._id;
        const heroId = req.params.id;
        
        console.log('Favoriting superhero:', { userId, heroId });
        
        // Get superhero info first
        let superhero = await Superhero.findOne({ apiId: heroId });
        if (!superhero) {
            console.log('Superhero not in database, fetching from API...');
            // If not in database, fetch from API
            const apiHero = await superheroApi.getSuperhero(heroId);
            superhero = new Superhero({
                apiId: apiHero.id,
                name: apiHero.name,
                image: apiHero.image.url,
                powerstats: apiHero.powerstats,
                biography: apiHero.biography,
                appearance: apiHero.appearance,
                work: apiHero.work,
                connections: apiHero.connections
            });
            await superhero.save();
            console.log('Superhero saved to database:', superhero.name);
        }
        
        // Get user and update favorites
        const user = await User.findById(userId);
        if (!user) {
            console.error('User not found:', userId);
            throw new Error('User not found');
        }
        
        console.log('User found:', user.username);
        console.log('Current favorites:', user.favorites);
        
        // Initialize favorites array if it doesn't exist
        if (!user.favorites) {
            user.favorites = [];
        }
        
        // Check if already favorited
        const isAlreadyFavorited = user.favorites.includes(heroId);
        console.log('Is already favorited:', isAlreadyFavorited);
        
        if (isAlreadyFavorited) {
            // Remove from favorites
            console.log('Removing from favorites...');
            user.favorites = user.favorites.filter(id => id !== heroId);
            await user.save();
            req.session.success = `${superhero.name} removed from favorites!`;
            console.log('Removed from favorites successfully');
        } else {
            // Add to favorites
            console.log('Adding to favorites...');
            user.favorites.push(heroId);
            await user.save();
            req.session.success = `${superhero.name} added to favorites!`;
            console.log('Added to favorites successfully');
        }
        
        res.redirect(`/superhero/${heroId}`);
    } catch (error) {
        console.error('Error favoriting superhero:', error);
        console.error('Error stack:', error.stack);
        req.session.error = 'Error updating favorites. Please try again.';
        res.redirect(`/superhero/${req.params.id}`);
    }
};

// Get user's favorite superheroes
exports.getFavorites = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    
    try {
        const userId = req.session.user._id;
        const user = await User.findById(userId);
        
        if (!user || !user.favorites || user.favorites.length === 0) {
            return res.render('favorites', {
                title: 'My Favorites',
                superheroes: [],
                message: 'You haven\'t favorited any superheroes yet!'
            });
        }
        
        // Get superhero details for each favorite
        const favoriteSuperheroes = await Superhero.find({
            apiId: { $in: user.favorites }
        });
        
        res.render('favorites', {
            title: 'My Favorites',
            superheroes: favoriteSuperheroes,
            message: null
        });
    } catch (error) {
        console.error('Error getting favorites:', error);
        res.render('favorites', {
            title: 'My Favorites',
            superheroes: [],
            message: 'Error loading favorites. Please try again.'
        });
    }
}; 