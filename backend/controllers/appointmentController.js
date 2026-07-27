const asyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private (patient)
const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, slotStart, slotEnd, reason } = req.body;

  if (!doctorId || !slotStart || !slotEnd) {
    res.status(400);
    throw new Error('doctorId, slotStart and slotEnd are required');
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }

  const start = new Date(slotStart);
  if (start.getTime() <= Date.now()) {
    res.status(400);
    throw new Error('Cannot book a slot in the past');
  }

  // The unique partial index on (doctor, slotStart) for status:'booked'
  // is what actually prevents double-booking under concurrent requests —
  // this check is just a fast-path for a friendlier error message.
  // If two requests race past this check, the DB insert below will
  // still reject the loser with a duplicate key error (handled by
  // the errorMiddleware as a 409).
  try {
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      slotStart: start,
      slotEnd: new Date(slotEnd),
      reason: reason || '',
      status: 'booked',
    });

    const populated = await appointment.populate([
      { path: 'doctor', populate: { path: 'user', select: 'name' } },
      { path: 'patient', select: 'name email' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      res.status(409);
      throw new Error('This slot was just booked by someone else. Please pick another time.');
    }
    throw error;
  }
});

// @desc    Get logged-in patient's own appointments
// @route   GET /api/appointments/mine
// @access  Private (patient)
const getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ patient: req.user._id })
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
    .sort({ slotStart: -1 });
  res.json(appointments);
});

// @desc    Get logged-in doctor's appointments
// @route   GET /api/appointments/doctor-schedule
// @access  Private (doctor)
const getDoctorAppointments = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor profile not found for this account');
  }

  const appointments = await Appointment.find({ doctor: doctor._id })
    .populate('patient', 'name email phone')
    .sort({ slotStart: 1 });
  res.json(appointments);
});

// @desc    Cancel an appointment (patient cancels own, doctor/admin can cancel any of theirs)
// @route   PUT /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  const isOwner = appointment.patient.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  let isDoctorForAppointment = false;
  if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.user._id });
    isDoctorForAppointment = doctor && doctor._id.toString() === appointment.doctor.toString();
  }

  if (!isOwner && !isAdmin && !isDoctorForAppointment) {
    res.status(403);
    throw new Error('Not authorized to cancel this appointment');
  }

  appointment.status = 'cancelled';
  await appointment.save();
  res.json({ message: 'Appointment cancelled', appointment });
});

// @desc    Doctor marks an appointment complete and adds notes
// @route   PUT /api/appointments/:id/complete
// @access  Private (doctor)
const completeAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor || doctor._id.toString() !== appointment.doctor.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this appointment');
  }

  appointment.status = 'completed';
  appointment.notes = req.body.notes || appointment.notes;
  await appointment.save();
  res.json(appointment);
});

module.exports = {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  cancelAppointment,
  completeAppointment,
};
