const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanager');
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@taskmanager.com' });
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists');
      return;
    }

    // Create admin user
    const adminUser = new User({
      email: 'admin@taskmanager.com',
      password: 'AdminPass123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@taskmanager.com');
    console.log('🔑 Password: AdminPass123');
    console.log('⚠️ Please change the password after first login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
createAdminUser();
