const express = require('express');
const router = express.Router();
const { createBooking, getAllBookings, rescheduleBooking, cancelBooking } = require('../controllers/booking.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.route('/')
  .post(createBooking)
  .get(getAllBookings);

router.patch('/:id/reschedule', rescheduleBooking);
router.patch('/:id/cancel', cancelBooking);

module.exports = router;
