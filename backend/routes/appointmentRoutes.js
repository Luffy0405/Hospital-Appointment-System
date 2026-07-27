const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  cancelAppointment,
  completeAppointment,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('patient'), bookAppointment);
router.get('/mine', protect, authorize('patient'), getMyAppointments);
router.get('/doctor-schedule', protect, authorize('doctor'), getDoctorAppointments);
router.put('/:id/cancel', protect, cancelAppointment);
router.put('/:id/complete', protect, authorize('doctor'), completeAppointment);

module.exports = router;
