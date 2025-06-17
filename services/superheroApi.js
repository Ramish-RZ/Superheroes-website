const fetch = require('node-fetch');

class SuperheroApi {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://superheroapi.com/api';
    }

    // Get a single superhero by ID
    async getSuperhero(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${this.apiKey}/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Superhero with ID ${id} not found`);
            }
            const data = await response.json();
            
            // Check if the API returned an error
            if (data.response === 'error') {
                throw new Error(data.error || 'Superhero not found');
            }
            
            return data;
        } catch (error) {
            console.error(`Error fetching superhero ID ${id}:`, error.message);
            throw error;
        }
    }

    // Search for superheroes by name
    async searchSuperheroes(name) {
        try {
            const response = await fetch(`${this.baseUrl}/${this.apiKey}/search/${encodeURIComponent(name)}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Search failed`);
            }
            const data = await response.json();
            
            // Check if the API returned an error
            if (data.response === 'error') {
                return []; // Return empty array if no results found
            }
            
            return data.results || [];
        } catch (error) {
            console.error(`Error searching for "${name}":`, error.message);
            throw error;
        }
    }

    // Get a random superhero
    async getRandomSuperhero() {
        try {
            // The API has 731 superheroes (based on the character list)
            const randomId = Math.floor(Math.random() * 731) + 1;
            return await this.getSuperhero(randomId);
        } catch (error) {
            console.error('Error fetching random superhero:', error.message);
            throw error;
        }
    }

    // Get multiple random superheroes
    async getRandomSuperheroes(count = 20) {
        try {
            const promises = Array(count).fill().map(() => this.getRandomSuperhero());
            return await Promise.all(promises);
        } catch (error) {
            console.error('Error fetching random superheroes:', error.message);
            throw error;
        }
    }

    // Get superheroes by specific IDs (useful for getting popular heroes)
    async getSuperheroesByIds(ids) {
        try {
            const promises = ids.map(id => this.getSuperhero(id));
            return await Promise.all(promises);
        } catch (error) {
            console.error('Error fetching superheroes by IDs:', error.message);
            throw error;
        }
    }

    // Get popular superheroes (using well-known IDs)
    async getPopularSuperheroes() {
        // Popular superhero IDs: Batman(69), Spider-Man(620), Superman(644), Iron Man(346), etc.
        const popularIds = [69, 620, 644, 346, 149, 659, 106, 213, 717, 720];
        return await this.getSuperheroesByIds(popularIds);
    }
}

module.exports = new SuperheroApi(process.env.SUPERHERO_API_KEY); 