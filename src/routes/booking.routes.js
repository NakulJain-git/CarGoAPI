import {Router} from 'express';
import {
    getAllBookings,
    getBookingById,
    createBooking,
    updateBooking,
    deleteBooking
} from '../controllers/booking.controllers.js';

import { verifyJWT,authorize } from '../middlewares/auth.middlewares.js';

const router = Router();
// Get all bookings
router.route('/').get(verifyJWT, getAllBookings)

router.route("/:brokerId").post(verifyJWT, authorize("admin"), createBooking);

router.route('/:id')
.get(verifyJWT, getBookingById)
.put(verifyJWT,  updateBooking)
.delete(verifyJWT, authorize("admin","user"), deleteBooking);

export default router;