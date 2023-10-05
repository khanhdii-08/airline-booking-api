import express, { Router } from 'express'
import { FlightController } from '~/controllers/flight.controller'

const router: Router = express.Router()

router.route('/search').get(FlightController.search)

export const FlightRoutes = router
