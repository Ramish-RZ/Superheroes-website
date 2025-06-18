require('dotenv').config();
const superheroApi = require('./services/superheroApi');

async function testApi() {
    console.log('🧪 Testing Superhero API...');
    console.log('API Key:', process.env.SUPERHERO_API_KEY ? '✓ Set' : '✗ Missing');
    
    if (!process.env.SUPERHERO_API_KEY) {
        console.log('\n❌ Please set your SUPERHERO_API_KEY in the .env file');
        console.log('Example: SUPERHERO_API_KEY=a42435a5887fd4443eab481cc56322dc');
        return;
    }

    try {
        // Test 1: Get a specific superhero (Batman - ID 69)
        console.log('\n1️⃣ Testing: Get Batman (ID 69)...');
        const batman = await superheroApi.getSuperhero(69);
        console.log(`✓ Success! Found: ${batman.name}`);
        console.log(`   Intelligence: ${batman.powerstats?.intelligence || 'N/A'}`);
        console.log(`   Strength: ${batman.powerstats?.strength || 'N/A'}`);

        // Test 2: Search for a superhero
        console.log('\n2️⃣ Testing: Search for "Spider"...');
        const searchResults = await superheroApi.searchSuperheroes('Spider');
        console.log(`✓ Success! Found ${searchResults.length} results`);
        if (searchResults.length > 0) {
            console.log(`   First result: ${searchResults[0].name}`);
        }

        // Test 3: Get a random superhero
        console.log('\n3️⃣ Testing: Get random superhero...');
        const randomHero = await superheroApi.getRandomSuperhero();
        console.log(`✓ Success! Random hero: ${randomHero.name}`);

        // Test 4: Get popular superheroes
        console.log('\n4️⃣ Testing: Get popular superheroes...');
        const popularHeroes = await superheroApi.getPopularSuperheroes();
        console.log(`✓ Success! Found ${popularHeroes.length} popular heroes`);
        popularHeroes.forEach(hero => {
            console.log(`   - ${hero.name} (ID: ${hero.id})`);
        });

        console.log('\n🎉 All API tests passed! Your token is working correctly.');
        console.log('\n📝 Next steps:');
        console.log('   1. Run "npm run seed" to populate your database');
        console.log('   2. Start your app with "npm start"');
        console.log('   3. Visit http://localhost:3000 to see your superhero website!');

    } catch (error) {
        console.error('\n❌ API test failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('   - Check if your API key is correct');
        console.log('   - Verify your internet connection');
        console.log('   - Make sure the superhero API is accessible');
    }
}

testApi(); 