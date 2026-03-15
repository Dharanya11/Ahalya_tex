import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const user = await User.findOne({ email: 'ahalya@gmail.com' });
    if (user) {
      console.log('User found in DB:');
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log('User not found in DB');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
};

checkUser();
