import { Router } from 'express'
import { BookingController } from '~/controllers/booking.controller'

const router = Router()

router.route('/').post(BookingController.booking)
router.route('/').get(BookingController.bookingDetail)

export const BookingRoutes = router
