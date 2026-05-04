const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb+srv://mughalhuzaifa3486_db_user:huzaifa1234@cluster0.w7fcnmb.mongodb.net/barber_shop';

  if (!process.env.MONGO_URI) {
    console.warn('MONGO_URI not set in .env, falling back to local MongoDB at mongodb+srv://mughalhuzaifa3486_db_user:huzaifa1234@cluster0.w7fcnmb.mongodb.net/barber_shop');
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;