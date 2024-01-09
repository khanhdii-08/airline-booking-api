import express, { Router } from 'express'
import { SeatController } from '~/controllers/seat.controller'

const router: Router = express.Router()

router.route('/all').get(SeatController.getAllSeat)

export const SeatRoutes = router
