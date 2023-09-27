import express, { Router } from 'express'
import { AirportController } from '~/controllers/airport.controller'

const router: Router = express.Router()

router.get('/all', AirportController.getAllAirPort)

export const AirportRoutes = router
