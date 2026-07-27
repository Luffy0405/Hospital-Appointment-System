const mongoose = require('mongoose');

// A doctor's weekly recurring availability, e.g. Monday 09:00-13:00
const availabilitySchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: Number, // 0 = Sunday ... 6 = Saturday
      required: true,
      min: 0,
      max: 6,
    },
    startTime: {
      type: String, // "09:00" 24hr format
      required: true,
    },
    endTime: {
      type: String, // "13:00"
      required: true,
    },
    slotDurationMinutes: {
      type: Number,
      default: 30,
    },
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialty: {
      type: String,
      required: [true, 'Specialty is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    bio: {
      type: String,
      default: '',
    },
    consultationFee: {
      type: Number,
      default: 0,
    },
    availability: [availabilitySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
