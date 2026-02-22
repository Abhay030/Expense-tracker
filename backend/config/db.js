const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            maxPoolSize: 10,      // Max 10 connections per server
            minPoolSize: 2,       // Keep 2 connections warm
            serverSelectionTimeoutMS: 5000,  // Fail fast if DB unreachable
            socketTimeoutMS: 45000,          // Close idle sockets after 45s
        });
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed", error.message);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
});

module.exports = connectDB;