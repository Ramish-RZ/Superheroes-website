const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        
        // Use local MongoDB for development
        const uri = process.env.NODE_ENV === 'production' 
            ? process.env.MONGODB_URI 
            : 'mongodb://localhost:27017/superhero-db';

        console.log(`Connecting to: ${uri.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@')}`);

        const conn = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        if (error.name === 'MongoServerSelectionError') {
            console.error('\nPossible solutions:');
            console.error('1. Make sure MongoDB is installed and running locally');
            console.error('2. Check if MongoDB service is running (services.msc)');
            console.error('3. Try connecting with MongoDB Compass to verify local connection');
        }
        process.exit(1);
    }
};

module.exports = connectDB; 