import { ServiceOptController } from '~/controllers/serviceOption.controller'
import express, { Router } from 'express'
import { ServiceOptValidation } from '~/validations/serviceOpt.validattion'

const router: Router = express.Router()

router.route('/').get(ServiceOptValidation.serviceOpt, ServiceOptController.getAllServiceOpt)

export const ServiceOpt = router
