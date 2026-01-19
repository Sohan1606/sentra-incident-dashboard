const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // HARDCODE - WILL WORK 100%
    const uri = 'mongodb://localhost:27017/sentra-incident-dashboard';
    console.log('🔗 Connecting to:', uri);
    
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
