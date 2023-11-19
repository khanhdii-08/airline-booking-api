import express, { Router } from 'express'
import { AdminController } from '~/controllers/admin.controller'
import { CheckAuth, CheckRole } from '~/middlewares'
import { UserType } from '~/utils/enums'

const router: Router = express.Router()

router
    .route('/report-client')
    .get(CheckAuth, CheckRole([UserType.ADMIN, UserType.MANAGER, UserType.CUSTOMER]), AdminController.reportClient)
router
    .route('/booking-limit-ten')
    .get(CheckAuth, CheckRole([UserType.ADMIN, UserType.MANAGER, UserType.EMPLOYEE]), AdminController.bookingsLimitTen)
router
    .route('/revenue-in-two-year')
    .get(CheckAuth, CheckRole([UserType.ADMIN, UserType.MANAGER, UserType.EMPLOYEE]), AdminController.revenueInTwoYear)
router
    .route('/statistical-client')
    .get(CheckAuth, CheckRole([UserType.ADMIN, UserType.MANAGER, UserType.EMPLOYEE]), AdminController.statisticalClient)
router
    .route('/statistical-revenue-by-year')
    .get(CheckAuth, CheckRole([UserType.ADMIN, UserType.MANAGER, UserType.EMPLOYEE]), AdminController.revenueByYear)

export const AdminRoutes = router
