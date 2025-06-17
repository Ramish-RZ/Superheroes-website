const Superhero = require('../models/Superhero');
const superheroApi = require('../services/superheroApi');

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