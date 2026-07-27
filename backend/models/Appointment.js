const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    slotStart: {
      type: Date,
      required: true,
    },
    slotEnd: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['booked', 'completed', 'cancelled', 'no-show'],
      default: 'booked',
    },
    reason: {
      type: String,
      default: '',
    },
    notes: {
      // doctor's notes / prescription, filled in after the visit
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// CRITICAL: prevents two patients from ever booking the exact same
// doctor + slotStart combination, even under concurrent requests.
// This is enforced at the database level, not just in application code.
appointmentSchema.index(
  { doctor: 1, slotStart: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'booked' },
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
