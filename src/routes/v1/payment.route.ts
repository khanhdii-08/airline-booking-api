import express, { Router } from 'express'
import { PaymentController } from '~/controllers/payment.controller'

const router: Router = express.Router()

router.route('/vnpay').post(PaymentController.paymentVnPay)

router.route('/vnpay-return').get(PaymentController.VnPayReturn)

export const PaymentRoutes = router
