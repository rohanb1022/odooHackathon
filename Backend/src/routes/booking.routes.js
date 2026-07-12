const express = require('express');
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  rescheduleBooking,
  cancelBooking,
  sendBookingReminders,
  updateBookingStatus,
} = require('../controllers/booking.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { createBookingValidator, rescheduleBookingValidator, cancelBookingValidator } = require('../validators/booking.validator');

router.use(verifyToken);

router.route('/')
  .post(createBookingValidator, createBooking)
  .get(getAllBookings);

router.post('/send-reminders', sendBookingReminders);
router.patch('/:id/status', updateBookingStatus);
router.patch('/:id/reschedule', rescheduleBookingValidator, rescheduleBooking);
router.patch('/:id/cancel', cancelBookingValidator, cancelBooking);

module.exports = router;


