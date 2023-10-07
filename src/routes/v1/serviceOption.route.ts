import { ServiceOptController } from '~/controllers/serviceOption.controller'
import express, { Router } from 'express'

const router: Router = express.Router()

router.route('/').get(ServiceOptController.getAllServiceOpt)

export const ServiceOpt = router
