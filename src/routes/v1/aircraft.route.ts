import { CheckAuth, CheckRole } from '~/middlewares'
import express, { Router } from 'express'
import { AircraftController } from '~/controllers/aircraft.controller'
import { UserType } from '~/utils/enums'

const router: Router = express.Router()

router.route('/').get(CheckAuth, CheckRole([UserType.ADMIN, UserType.MANAGER]), AircraftController.aircrafts)

export const AircraftRoutes = router
