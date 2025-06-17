const mongoose = require('mongoose');

const superheroSchema = new mongoose.Schema({
    apiId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    powerstats: {
        intelligence: Number,
        strength: Number,
        speed: Number,
        durability: Number,
        power: Number,
        combat: Number
    },
    biography: {
        fullName: String,
        alterEgos: String,
        aliases: [String],
        placeOfBirth: String,
        publisher: String,
        alignment: String
    },
    appearance: {
        gender: String,
        race: String,
        height: [String],
        weight: [String],
        eyeColor: String,
        hairColor: String
    },
    work: {
        occupation: String,
        base: String
    },
    connections: {
        groupAffiliation: String,
        relatives: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Superhero', superheroSchema); 