import { Router } from 'express'
import { BookingController } from '~/controllers/booking.controller'

const router = Router()

router.route('/').post(BookingController.booking)
router.route('/').get(BookingController.search)

export const BookingRoutes = router
