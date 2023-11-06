import { CheckRole } from './../../middlewares/checkRole'
import { CheckAuth } from './../../middlewares/checkAuth'
import express, { Router } from 'express'
import { AircraftController } from '~/controllers/aircraft.controller'
import { UserType } from '~/utils/enums'

const router: Router = express.Router()

router.route('/').get(AircraftController.aircrafts)

export const AircraftRoutes = router
