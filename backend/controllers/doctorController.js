const asyncHandler = require('express-async-handler');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// @desc    Get all doctors (optionally filter by department or specialty)
// @route   GET /api/doctors
// @access  Public
const getDoctors = asyncHandler(async (req, res) => {
  const { department, specialty, search } = req.query;
  const filter = {};
  if (department) filter.department = department;
  if (specialty) filter.specialty = specialty;

  let query = Doctor.find(filter).populate('user', 'name email phone');

  const doctors = await query;

  const filtered = search
    ? doctors.filter((d) =>
        d.user.name.toLowerCase().includes(search.toLowerCase())
      )
    : doctors;

  res.json(filtered);
});

// @desc    Get single doctor by id
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate('user', 'name email phone');
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }
  res.json(doctor);
});

// @desc    Get/create the logged-in doctor's own profile
// @route   GET /api/doctors/me/profile
// @access  Private (doctor)
const getMyDoctorProfile = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id }).populate('user', 'name email phone');
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor profile not found for this account');
  }
  res.json(doctor);
});

// @desc    Update doctor's own profile (bio, fee, specialty, department)
// @route   PUT /api/doctors/me/profile
// @access  Private (doctor)
const updateMyDoctorProfile = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor profile not found for this account');
  }

  const { specialty, department, bio, consultationFee } = req.body;
  if (specialty !== undefined) doctor.specialty = specialty;
  if (department !== undefined) doctor.department = department;
  if (bio !== undefined) doctor.bio = bio;
  if (consultationFee !== undefined) doctor.consultationFee = consultationFee;

  const updated = await doctor.save();
  res.json(updated);
});

// @desc    Set/replace the logged-in doctor's weekly availability
// @route   PUT /api/doctors/me/availability
// @access  Private (doctor)
const setMyAvailability = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor profile not found for this account');
  }

  const { availability } = req.body; // array of { dayOfWeek, startTime, endTime, slotDurationMinutes }
  if (!Array.isArray(availability)) {
    res.status(400);
    throw new Error('Availability must be an array');
  }

  doctor.availability = availability;
  const updated = await doctor.save();
  res.json(updated);
});

// Helper: turn "HH:MM" + a base date into a Date object on that day
const timeToDate = (baseDate, hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(baseDate);
  d.setHours(h, m, 0, 0);
  return d;
};

// @desc    Get available slots for a doctor on a given date (?date=YYYY-MM-DD)
// @route   GET /api/doctors/:id/slots
// @access  Public
const getAvailableSlots = asyncHandler(async (req, res) => {
  const { date } = req.query;
  if (!date) {
    res.status(400);
    throw new Error('A date query parameter (YYYY-MM-DD) is required');
  }

  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }

  const requestedDate = new Date(date + 'T00:00:00');
  const dayOfWeek = requestedDate.getDay();

  const rulesForDay = doctor.availability.filter((a) => a.dayOfWeek === dayOfWeek);
  if (rulesForDay.length === 0) {
    return res.json({ date, slots: [] });
  }

  // Build the full list of candidate slots from the doctor's recurring rules
  let candidateSlots = [];
  for (const rule of rulesForDay) {
    const start = timeToDate(requestedDate, rule.startTime);
    const end = timeToDate(requestedDate, rule.endTime);
    const duration = rule.slotDurationMinutes || 30;

    let cursor = new Date(start);
    while (cursor.getTime() + duration * 60000 <= end.getTime()) {
      const slotStart = new Date(cursor);
      const slotEnd = new Date(cursor.getTime() + duration * 60000);
      candidateSlots.push({ slotStart, slotEnd });
      cursor = slotEnd;
    }
  }

  // Exclude slots already booked for this doctor on this date
  const dayStart = new Date(requestedDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(requestedDate);
  dayEnd.setHours(23, 59, 59, 999);

  const bookedAppointments = await Appointment.find({
    doctor: doctor._id,
    status: 'booked',
    slotStart: { $gte: dayStart, $lte: dayEnd },
  }).select('slotStart');

  const bookedTimes = new Set(bookedAppointments.map((a) => a.slotStart.getTime()));

  // Also exclude past slots if the requested date is today
  const now = new Date();

  const openSlots = candidateSlots.filter(
    (s) => !bookedTimes.has(s.slotStart.getTime()) && s.slotStart.getTime() > now.getTime()
  );

  res.json({ date, slots: openSlots });
});

module.exports = {
  getDoctors,
  getDoctorById,
  getMyDoctorProfile,
  updateMyDoctorProfile,
  setMyAvailability,
  getAvailableSlots,
};
