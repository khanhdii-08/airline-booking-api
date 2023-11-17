import { Router } from 'express'
import { BookingController } from '~/controllers/booking.controller'
import { CheckAuth, CheckRole } from '~/middlewares'
import { UserType } from '~/utils/enums'
import { BookingValidation } from '~/validations/booking.validation'

const router = Router()

router.route('/').post(BookingController.booking)
router.route('/').get(BookingValidation.search, BookingController.search)
router.route('/').patch(BookingController.bookingCancel)
router.route('/').put(BookingController.updateBooking)
router.route('/add-service').post(BookingController.bookingAddService)
router.route('/my-booking/:status').get(CheckAuth, BookingController.myBooking)
router
    .route('/:status')
    .get(CheckAuth, CheckRole([UserType.EMPLOYEE, UserType.MANAGER, UserType.ADMIN]), BookingController.bookingsCancel)
router
    .route('/change-status')
    .patch(CheckAuth, CheckRole([UserType.EMPLOYEE, UserType.MANAGER, UserType.ADMIN]), BookingController.upadateStatus)
router
    .route('/cancel')
    .patch(
        CheckAuth,
        CheckRole([UserType.EMPLOYEE, UserType.MANAGER, UserType.ADMIN]),
        BookingController.cancelBookings
    )
router
    .route('/admin/all')
    .get(CheckAuth, CheckRole([UserType.EMPLOYEE, UserType.MANAGER, UserType.ADMIN]), BookingController.bookings)

export const BookingRoutes = router
