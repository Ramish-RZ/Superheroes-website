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

        // Top 10 most favorited superheroes
        const topFavoritesAgg = await User.aggregate([
            { $unwind: "$favorites" },
            { $group: { _id: "$favorites.heroId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        const topFavoriteIds = topFavoritesAgg.map(f => f._id);
        const topFavoriteHeroes = await Superhero.find({ apiId: { $in: topFavoriteIds } });
        // Sort by count and filter out any undefined heroes
        const topFavorites = topFavoriteIds.map(id => topFavoriteHeroes.find(h => h.apiId === id)).filter(Boolean);
        const topFavoritesWithCount = topFavorites.map((hero, i) => ({ 
            hero, 
            count: topFavoritesAgg.find(f => f._id === hero.apiId)?.count || 0 
        }));

        // Get user's favorite heroIds for quick lookup
        let userFavoriteIds = [];
        if (req.session.user) {
            const user = await User.findById(req.session.user.id);
            if (user && user.favorites) {
                userFavoriteIds = user.favorites.map(f => f.heroId);
            }
        }

        res.render('index', {
            title: 'Home',
            superheroes,
            pagination: {
                currentPage: page,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            userFavoriteIds,
            topFavorites: topFavoritesWithCount
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

// Favorite/unfavorite superhero (toggle)
exports.favoriteSuperhero = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Please log in to favorite superheroes');
    }
    try {
        const userId = req.session.user.id;
        const heroId = req.params.id;
        let { reason } = req.body;
        if (typeof reason !== 'string') reason = '';

        // Get superhero info first
        let superhero = await Superhero.findOne({ apiId: heroId });
        if (!superhero) {
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
        }

        // Get user and update favorites
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');
        if (!user.favorites) user.favorites = [];
        const favIndex = user.favorites.findIndex(f => f.heroId === heroId);
        if (favIndex !== -1) {
            // Remove from favorites
            user.favorites.splice(favIndex, 1);
            await user.save();
            req.session.success = `${superhero.name} removed from favorites!`;
        } else {
            // Add to favorites
            user.favorites.push({ heroId, reason });
            await user.save();
            req.session.success = `${superhero.name} added to favorites!`;
        }
        res.redirect(req.body.fromProfile ? '/profile' : req.body.fromHome ? '/' : `/superhero/${heroId}`);
    } catch (error) {
        console.error('Error favoriting superhero:', error);
        req.session.error = 'Error updating favorites. Please try again.';
        res.redirect('back');
    }
};

// Update reason for a favorite
exports.updateFavoriteReason = async (req, res) => {
    if (!req.session.user) return res.status(401).send('Please log in');
    try {
        const userId = req.session.user.id;
        const { heroId, reason } = req.body;
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');
        const fav = user.favorites.find(f => f.heroId === heroId);
        if (fav) {
            fav.reason = reason;
            await user.save();
            req.session.success = 'Reason updated!';
        }
        res.redirect('/profile');
    } catch (error) {
        console.error('Error updating reason:', error);
        req.session.error = 'Error updating reason.';
        res.redirect('/profile');
    }
};

// Get user's favorite superheroes (for profile)
exports.getProfile = async (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    try {
        const userId = req.session.user.id;
        const user = await User.findById(userId);
        let favoritesDetailed = [];
        if (user && user.favorites && user.favorites.length > 0) {
            const heroIds = user.favorites.map(f => f.heroId);
            const heroes = await Superhero.find({ apiId: { $in: heroIds } });
            favoritesDetailed = user.favorites.map(fav => {
                const hero = heroes.find(h => h.apiId === fav.heroId);
                return hero ? { ...hero.toObject(), reason: fav.reason } : null;
            }).filter(Boolean);
        }
        res.render('profile', { user, favorites: favoritesDetailed });
    } catch (error) {
        console.error('Error loading profile:', error);
        res.render('profile', { user: req.session.user, favorites: [], messages: { error: 'Error loading profile.' } });
    }
};

// Get user's favorite superheroes (for favorites page)
exports.getFavorites = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    
    try {
        const userId = req.session.user.id;
        const user = await User.findById(userId);
        
        if (!user || !user.favorites || user.favorites.length === 0) {
            return res.render('favorites', {
                title: 'My Favorites',
                superheroes: [],
                message: 'You haven\'t favorited any superheroes yet!'
            });
        }
        
        // Get superhero details for each favorite
        const heroIds = user.favorites.map(f => f.heroId);
        const favoriteSuperheroes = await Superhero.find({
            apiId: { $in: heroIds }
        });
        
        // Add reasons to the superhero objects
        const favoritesWithReasons = favoriteSuperheroes.map(hero => {
            const fav = user.favorites.find(f => f.heroId === hero.apiId);
            return { ...hero.toObject(), reason: fav ? fav.reason : '' };
        });
        
        res.render('favorites', {
            title: 'My Favorites',
            superheroes: favoritesWithReasons,
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