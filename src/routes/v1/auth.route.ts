import express, { Router } from 'express'
import { AuthController } from '~/controllers/auth.controller'
import { AuthValidation } from '~/validations/auth.validation'

const router: Router = express.Router()

router.route('/register').post(AuthValidation.register, AuthController.register)

export const AuthRoutes = router
