require('dotenv').config(); // Load environment variables from .env
const mongoose = require('mongoose');
// Get the environment
const environment = process.env.NODE_ENV || 'development';

// Set MongoDB URI based on the environment
const mongoUri =
    environment === 'production' ? process.env.MONGODB_URI : process.env.MONGODB_URI;

// Connect to MongoDB
const connectToMongoDB = async() => {
    try {
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`Connected to MongoDB in ${environment} mode`);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

// Export connection for reuse
module.exports = connectToMongoDB;