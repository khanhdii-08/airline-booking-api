import express, { Router } from 'express'
import { AuthController } from '~/controllers/auth.controller'
import { AuthValidation } from '~/validations/auth.validation'

const router: Router = express.Router()

router.route('/register').post(AuthValidation.register, AuthController.register)
router.route('/verify').post(AuthValidation.verify, AuthController.verify)
router.route('/send-otp').post(AuthValidation.sendOTP, AuthController.sendOtp)
router.route('/login').post(AuthController.login)

export const AuthRoutes = router
