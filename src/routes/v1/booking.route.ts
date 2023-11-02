import { Router } from 'express'
import { BookingController } from '~/controllers/booking.controller'
import { CheckAuth } from '~/middlewares'
import { BookingValidation } from '~/validations/booking.validation'

const router = Router()

router.route('/').post(BookingController.booking)
router.route('/').get(BookingValidation.search, BookingController.search)
router.route('/').patch(BookingController.bookingCancel)
router.route('/').put(BookingController.updateBooking)
router.route('/add-service').post(BookingController.bookingAddService)
router.route('/my-booking/:status').get(CheckAuth, BookingController.myBooking)

export const BookingRoutes = router
