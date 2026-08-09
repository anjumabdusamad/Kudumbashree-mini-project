const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const NHG = require('./models/NHG');

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kudumbashree');
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await User.deleteMany();
    await NHG.deleteMany();
    console.log('Existing data cleared...');

    // 1. Create a default NHG
    const nhg1 = await NHG.create({
      name: 'Kairali Ayalkootam',
      code: 'NHG101',
      location: 'Ward 4, Trivandrum',
      status: 'active',
    });
    console.log('Default NHG Created:', nhg1.name);

    // 2. Create Admin user
    const admin = await User.create({
      name: 'Deepa K. P. (Admin)',
      email: 'admin@gmail.com',
      password: 'adminpassword', // Will be hashed by user pre-save hook
      phone: '9876543210',
      role: 'admin',
      status: 'approved',
      isVerified: true,
    });
    console.log('Admin User Created:', admin.email);

    // 3. Create Approved Member user associated with the NHG
    const approvedMember = await User.create({
      name: 'Radha Shaji (Member)',
      email: 'member@gmail.com',
      password: 'memberpassword',
      phone: '9876543211',
      role: 'member',
      nhg: nhg1._id,
      status: 'approved',
      isVerified: true,
      savingsBalance: 1250, // Starter savings
    });
    console.log('Approved Member Created:', approvedMember.email);

    // 4. Associate member with NHG and assign leadership for demo purposes
    nhg1.members.push(approvedMember._id);
    nhg1.president = approvedMember._id; // Let approved member be the president
    await nhg1.save();
    console.log('Member linked to NHG as President');

    // 5. Create a Pending Member user
    const pendingMember = await User.create({
      name: 'Suma Sunil',
      email: 'pending@gmail.com',
      password: 'pendingpassword',
      phone: '9876543212',
      role: 'member',
      nhg: nhg1._id,
      status: 'pending',
      savingsBalance: 0,
    });
    console.log('Pending Member Created:', pendingMember.email);

    console.log('Data Seeding Completed Successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
