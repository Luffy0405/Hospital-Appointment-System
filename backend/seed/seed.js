// Populates the database with a few demo doctors and a demo patient.
// Run with: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

const run = async () => {
  await connectDB();

  await User.deleteMany();
  await Doctor.deleteMany();
  await Appointment.deleteMany();

  const patient = await User.create({
    name: 'Asha Patel',
    email: 'patient@example.com',
    password: 'password123',
    role: 'patient',
    phone: '9876543210',
  });

  const admin = await User.create({
    name: 'Hospital Admin',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
  });

  const doctorUsers = await User.insertMany([
    { name: 'Dr. Rahul Mehta', email: 'rahul.mehta@example.com', password: 'password123', role: 'doctor' },
    { name: 'Dr. Sara Khan', email: 'sara.khan@example.com', password: 'password123', role: 'doctor' },
    { name: 'Dr. Wei Chen', email: 'wei.chen@example.com', password: 'password123', role: 'doctor' },
  ]);
  // insertMany skips the pre-save hash hook, so re-save each to hash passwords
  for (const u of doctorUsers) {
    u.password = 'password123';
    await u.save();
  }

  const weekdayAvailability = [1, 2, 3, 4, 5].map((day) => ({
    dayOfWeek: day,
    startTime: '09:00',
    endTime: '13:00',
    slotDurationMinutes: 30,
  }));

  await Doctor.create([
    {
      user: doctorUsers[0]._id,
      specialty: 'Cardiology',
      department: 'Cardiology',
      bio: 'Specializes in interventional cardiology, 12 years of experience.',
      consultationFee: 800,
      availability: weekdayAvailability,
    },
    {
      user: doctorUsers[1]._id,
      specialty: 'Dermatology',
      department: 'Dermatology',
      bio: 'Focused on clinical and cosmetic dermatology.',
      consultationFee: 600,
      availability: weekdayAvailability,
    },
    {
      user: doctorUsers[2]._id,
      specialty: 'Pediatrics',
      department: 'Pediatrics',
      bio: 'Pediatric care for infants through adolescents.',
      consultationFee: 500,
      availability: weekdayAvailability,
    },
  ]);

  console.log('Seed data created:');
  console.log('  Patient login -> patient@example.com / password123');
  console.log('  Admin login   -> admin@example.com / password123');
  console.log('  Doctor logins -> rahul.mehta@example.com / sara.khan@example.com / wei.chen@example.com (password123)');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
