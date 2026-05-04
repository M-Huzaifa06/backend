const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Branch = require('./models/Branch');
const Barber = require('./models/Barber');
const Service = require('./models/Service');
const User = require('./models/User');

dotenv.config();

connectDB();

const branches = [
  {
    legacyId: 101,
    name: 'Downtown Studio',
    city: 'Washington',
    address: '123 New Lenox Street',
    phone: '123-456-7890',
    hours: 'Mon - Sat, 11 AM - 9 PM',
    image: 'https://images.pexels.com/photos/3998422/pexels-photo-3998422.jpeg?auto=compress&cs=tinysrgb&w=1000',
  },
  {
    legacyId: 102,
    name: 'West End Lounge',
    city: 'Manhattan',
    address: '44 Hudson Avenue',
    phone: '123-456-8890',
    hours: 'Mon - Fri, 9 AM - 8 PM',
    image: 'https://images.pexels.com/photos/3998420/pexels-photo-3998420.jpeg?auto=compress&cs=tinysrgb&w=1000',
  },
  {
    legacyId: 103,
    name: 'Uptown House',
    city: 'Brooklyn',
    address: '78 Fulton Market',
    phone: '123-555-0194',
    hours: 'Tue - Sun, 10 AM - 7 PM',
    image: 'https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg?auto=compress&cs=tinysrgb&w=1000',
  },
  {
    legacyId: 104,
    name: 'Harbor Chair',
    city: 'Queens',
    address: '9 Barber Lane',
    phone: '123-555-0148',
    hours: 'Mon - Sat, 10 AM - 8 PM',
    image: 'https://images.pexels.com/photos/3992876/pexels-photo-3992876.jpeg?auto=compress&cs=tinysrgb&w=1000',
  },
];

const staff = [
  {
    name: 'Tony Lynch',
    role: 'Master Barber',
    image: 'https://images.pexels.com/photos/3998414/pexels-photo-3998414.jpeg?auto=compress&cs=tinysrgb&w=900',
    experience: '5 years experience',
  },
  {
    name: 'Leonard Smith',
    role: 'Hair Stylist',
    image: 'https://images.pexels.com/photos/3992871/pexels-photo-3992871.jpeg?auto=compress&cs=tinysrgb&w=900',
    experience: '2 years experience',
  },
  {
    name: 'Steven Brown',
    role: 'Senior Barber',
    image: 'https://images.pexels.com/photos/7697394/pexels-photo-7697394.jpeg?auto=compress&cs=tinysrgb&w=900',
    experience: '6 years experience',
  },
];

const services = [
  // Male services
  { name: 'Beard Trim', price: 20, duration: 20, gender: 'male' },
  { name: 'Facial & Grooming', price: 30, duration: 40, gender: 'male' },
  { name: 'Hair Color', price: 45, duration: 45, gender: 'male' },
  { name: 'Hair Color (Men)', price: 40, duration: 45, gender: 'male' },
  { name: 'Head Massage', price: 12, duration: 15, gender: 'male' },
  { name: "Men's Haircut", price: 25, duration: 30, gender: 'male' },
  { name: 'Slop Bread Trim', price: 25, duration: 40, gender: 'male' },
  { name: 'Wolf hair Cut', price: 35, duration: 40, gender: 'male' },
  // Female services
  { name: 'Blow Dry', price: 35, duration: 30, gender: 'female' },
  { name: 'Hair Color (Women)', price: 65, duration: 90, gender: 'female' },
  { name: 'Hair Treatment', price: 50, duration: 60, gender: 'female' },
  { name: "Ladies Haircut", price: 40, duration: 45, gender: 'female' },
  { name: 'Head Massage', price: 12, duration: 15, gender: 'female' },
  { name: 'Highlights', price: 80, duration: 120, gender: 'female' },
];

const importData = async () => {
  try {
    await Branch.deleteMany();
    await Barber.deleteMany();
    await Service.deleteMany();
    await User.deleteMany();

    const createdBranches = await Branch.insertMany(branches);

    // Assign staff to branches (distribute evenly)
    const staffWithBranches = staff.map((s, index) => ({
      ...s,
      branchId: createdBranches[index % createdBranches.length]._id,
      legacyBranchId: createdBranches[index % createdBranches.length].legacyId,
    }));

    await Barber.insertMany(staffWithBranches);
    await Service.insertMany(services);

    // Create test user
    await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Branch.deleteMany();
    await Barber.deleteMany();
    await Service.deleteMany();
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