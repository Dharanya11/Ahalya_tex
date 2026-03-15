import mongoose from 'mongoose';
import dotenv from 'dotenv';
// import colors from 'colors';
import users from './data/users.js';
import { getAllProducts } from './data/products.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    const createdUsers = [];
    for (const u of users) {
      const user = new User(u);
      createdUsers.push(await user.save());
    }

    const adminUser = createdUsers[0]._id;

    const products = getAllProducts();

    const sampleProducts = products.map((product) => {
      // Remove 'id' as Mongo generates '_id'. Keep it if needed as 'originalId'
      const { id, ...rest } = product;
      return { ...rest, user: adminUser };
    });

    await Product.insertMany(sampleProducts);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
