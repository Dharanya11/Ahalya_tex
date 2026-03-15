/**
 * Create an Admin user in MongoDB (passwords hashed with bcrypt)
 * Run: node scripts/createAdmin.js
 *
 * Edit the ADMIN_EMAIL and ADMIN_PASSWORD below before running.
 * Or use environment variables: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME
 *
 * If the admin already exists and you want to RESET the password, run with:
 * - ADMIN_RESET_PASSWORD=true
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';
import { ADMIN_EMAIL, ADMIN_DEFAULT_PASSWORD } from '../config/admin.js';

dotenv.config();
connectDB();

// This script enforces ONE admin:
// - Email is always admin@example.com (cannot be changed)
// - Password defaults to admin123 (can be overridden via env ADMIN_PASSWORD)
// - Running this script will ensure:
//   1) That admin exists
//   2) That all other users are demoted to normal users
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ADMIN_DEFAULT_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin User';
const ADMIN_RESET_PASSWORD = process.env.ADMIN_RESET_PASSWORD === 'true';

const createAdmin = async () => {
  try {
    // Demote anyone who is currently admin but not the single admin email
    await User.updateMany(
      { email: { $ne: ADMIN_EMAIL }, role: 'admin' },
      { $set: { role: 'user', isAdmin: false } }
    );

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      // Force it to be admin (User model hook also enforces this)
      existing.name = existing.name || ADMIN_NAME;
      if (ADMIN_RESET_PASSWORD) {
        existing.password = ADMIN_PASSWORD; // will be hashed by pre-save hook
      }
      await existing.save();
      if (ADMIN_RESET_PASSWORD) {
        console.log('Admin password reset successfully:', ADMIN_EMAIL);
      } else {
        console.log('Admin already exists:', ADMIN_EMAIL);
        console.log('Tip: set ADMIN_RESET_PASSWORD=true to reset password.');
      }
      process.exit(0);
      return;
    }

    const admin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      // role/isAdmin are enforced by the User model single-admin rule
    });

    console.log('Admin created successfully:', admin.email);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
