import express, { Router } from 'express'
import { FlightController } from '~/controllers/flight.controller'
import { FlightValidation } from '~/validations/flight.validation'

const router: Router = express.Router()

router.route('/search').get(FlightValidation.search, FlightController.search)

export const FlightRoutes = router
