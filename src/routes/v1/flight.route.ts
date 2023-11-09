import express, { Router } from 'express'
import { FlightController } from '~/controllers/flight.controller'
import { CheckAuth, CheckRole } from '~/middlewares'
import { UserType } from '~/utils/enums'
import { FlightValidation } from '~/validations/flight.validation'

const router: Router = express.Router()

router.route('/search').get(FlightValidation.search, FlightController.search)
router.route('/').post(FlightController.create)
router
    .route('/:status')
    .get(CheckAuth, CheckRole([UserType.ADMIN, UserType.EMPLOYEE, UserType.MANAGER]), FlightController.flights)

export const FlightRoutes = router
