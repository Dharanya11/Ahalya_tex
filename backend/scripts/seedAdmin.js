import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const createDefaultAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'admin@example.com';
    const password = 'admin123';

    let user = await User.findOne({ email });

    if (user) {
      user.password = password;
      user.isAdmin = true;
      user.role = 'admin';
      await user.save();
      console.log(`Updated existing user ${email} to Admin with new password.`);
    } else {
      await User.create({
        name: 'Admin User',
        email,
        password,
        role: 'admin',
        isAdmin: true,
      });
      console.log(`Created new Admin account: ${email}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating default admin:', error);
    process.exit(1);
  }
};

createDefaultAdmin();
