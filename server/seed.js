const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Adjust path if needed
require('dotenv').config();

const seedAdmin = async () => {
  try {
    // 1. Connect to DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🌱 MongoDB Connected for Seeding');

    // 2. Check if Admin already exists
    const existingAdmin = await User.findOne({ rollNumber: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin already exists. Skipping...');
      process.exit();
    }

    // 3. Create Admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt); // Default Password: admin123

    const adminUser = new User({
      name: 'Super Admin',
      rollNumber: 'admin',
      password: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();
    console.log('✅ Admin Account Created Successfully');
    console.log('👉 Roll No: admin');
    console.log('👉 Password: admin123');

    process.exit();
  } catch (err) {
    console.error('❌ Seeding Error:', err);
    process.exit(1);
  }
};

seedAdmin();