import express, { Router } from 'express'
import { FlightController } from '~/controllers/flight.controller'
import { CheckAuth, CheckRole } from '~/middlewares'
import { UserType } from '~/utils/enums'
import { FlightValidation } from '~/validations/flight.validation'

const router: Router = express.Router()

router.route('/search').get(FlightValidation.search, FlightController.search)
router
    .route('/')
    .post(CheckAuth, CheckRole([UserType.ADMIN, UserType.EMPLOYEE, UserType.MANAGER]), FlightController.create)
router
    .route('/:status')
    .get(CheckAuth, CheckRole([UserType.ADMIN, UserType.EMPLOYEE, UserType.MANAGER]), FlightController.flights)
router
    .route('/:id')
    .put(CheckAuth, CheckRole([UserType.ADMIN, UserType.EMPLOYEE, UserType.MANAGER]), FlightController.updateFlight)
router
    .route('/id/:id')
    .get(CheckAuth, CheckRole([UserType.ADMIN, UserType.EMPLOYEE, UserType.MANAGER]), FlightController.flight)
router.route('/:id').patch(CheckAuth, CheckRole([UserType.ADMIN]), FlightController.updateStatus)

export const FlightRoutes = router
