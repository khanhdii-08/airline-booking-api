import { Router } from 'express'
import { BookingController } from '~/controllers/booking.controller'

const router = Router()

router.route('/').post(BookingController.booking)
router.route('/').get(BookingController.search)
router.route('/').patch(BookingController.bookingCancel)
router.route('/').put(BookingController.updateBooking)
router.route('/add-service').post(BookingController.bookingAddService)

export const BookingRoutes = router
