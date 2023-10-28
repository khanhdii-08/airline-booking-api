import express, { Router } from 'express'
import { CheckInController } from '~/controllers/checkIn.controller'

const router: Router = express.Router()

router.route('/').post(CheckInController.checkIn)

export const CheckInRoutes = router
