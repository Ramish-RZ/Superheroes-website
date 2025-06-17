require('dotenv').config();
const mongoose = require('mongoose');
const Superhero = require('../models/Superhero');
const superheroApi = require('../services/superheroApi');

// Connect to MongoDB
const connectDB = async () => {
    try {
        // Use environment variable for MongoDB connection
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/superhero-db';
        const conn = await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1);
    }
};

// Fetch and store superheroes
const seedDatabase = async () => {
    try {
        console.log('Starting database seeding...');
        console.log('Using API Key:', process.env.SUPERHERO_API_KEY ? '✓ Set' : '✗ Missing');
        
        // Clear existing data
        await Superhero.deleteMany({});
        console.log('Cleared existing superhero data');

        // Get total number of superheroes (the API has 731)
        const totalSuperheroes = 731;
        const batchSize = 10; // Reduced batch size to avoid rate limits
        const batches = Math.ceil(totalSuperheroes / batchSize);

        console.log(`Fetching ${totalSuperheroes} superheroes in ${batches} batches...`);
        console.log(`Batch size: ${batchSize} (to avoid API rate limits)`);

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < batches; i++) {
            const startId = i * batchSize + 1;
            const endId = Math.min((i + 1) * batchSize, totalSuperheroes);
            
            console.log(`\nProcessing batch ${i + 1}/${batches} (IDs ${startId}-${endId})...`);
            
            // Create an array of promises for this batch
            const promises = [];
            for (let id = startId; id <= endId; id++) {
                promises.push(
                    superheroApi.getSuperhero(id)
                        .then(async (hero) => {
                            try {
                                const superhero = new Superhero({
                                    apiId: hero.id,
                                    name: hero.name,
                                    image: hero.image?.url || '',
                                    powerstats: hero.powerstats || {},
                                    biography: hero.biography || {},
                                    appearance: hero.appearance || {},
                                    work: hero.work || {},
                                    connections: hero.connections || {}
                                });
                                await superhero.save();
                                successCount++;
                                console.log(`✓ Saved: ${hero.name} (ID: ${hero.id})`);
                            } catch (error) {
                                errorCount++;
                                console.error(`✗ Error saving ${hero.name}:`, error.message);
                            }
                        })
                        .catch(error => {
                            errorCount++;
                            console.error(`✗ Error fetching hero ${id}:`, error.message);
                        })
                );
            }

            // Wait for all promises in this batch to complete
            await Promise.all(promises);
            
            // Add a delay between batches to avoid rate limiting
            if (i < batches - 1) {
                console.log('Waiting 2 seconds before next batch...');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        console.log('\n=== Database Seeding Summary ===');
        console.log(`✓ Successfully saved: ${successCount} superheroes`);
        console.log(`✗ Errors: ${errorCount} superheroes`);
        console.log(`Total processed: ${successCount + errorCount}`);
        
        if (successCount > 0) {
            console.log('\n🎉 Database seeding completed successfully!');
        } else {
            console.log('\n❌ No superheroes were saved. Check your API key and network connection.');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

// Run the seeding process
connectDB().then(() => {
    seedDatabase();
}); 