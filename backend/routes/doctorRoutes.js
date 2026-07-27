const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  getMyDoctorProfile,
  updateMyDoctorProfile,
  setMyAvailability,
  getAvailableSlots,
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Specific routes before the /:id catch-all
router.get('/me/profile', protect, authorize('doctor'), getMyDoctorProfile);
router.put('/me/profile', protect, authorize('doctor'), updateMyDoctorProfile);
router.put('/me/availability', protect, authorize('doctor'), setMyAvailability);

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/slots', getAvailableSlots);

module.exports = router;
