/**
 * Seed script — creates the first Admin user.
 * Run: node scripts/seed.js
 *
 * This is the ONLY way to bootstrap an admin account.
 * After this, the admin promotes other employees via the API.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const connectDB = require('../src/config/db');

const seed = async () => {
  await connectDB();

  const adminEmail = 'admin@assetflow.com';

  const existing = await User.findOne({ email: adminEmail });
  if (existing) {
    console.log(`ℹ️  Admin already exists: ${adminEmail}`);
    process.exit(0);
  }

  const admin = await User.create({
    name: 'System Admin',
    email: adminEmail,
    password: 'Admin@1234',
    role: 'admin',
    status: 'Active',
  });

  console.log('✅ Admin user created successfully!');
  console.log(`   Email   : ${admin.email}`);
  console.log(`   Password: Admin@1234`);
  console.log(`   Role    : ${admin.role}`);
  console.log('\n⚠️  Please change the password after first login!');

  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
