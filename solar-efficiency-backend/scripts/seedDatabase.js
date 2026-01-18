const mongoose = require('mongoose');
const connectDB = require('../src/config/db');

// Import models and seed data as needed

const seed = async () => {
  // await connectDB();
  console.log('Seeding database...');
  // Logic here
  console.log('Database seeded.');
  process.exit();
};

seed();
