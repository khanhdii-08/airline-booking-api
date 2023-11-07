import express, { Router } from 'express'
import { FlightController } from '~/controllers/flight.controller'
import { FlightValidation } from '~/validations/flight.validation'

const router: Router = express.Router()

router.route('/search').get(FlightValidation.search, FlightController.search)
router.route('/').post(FlightController.create)

export const FlightRoutes = router
