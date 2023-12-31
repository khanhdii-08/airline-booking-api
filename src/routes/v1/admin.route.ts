import express, { Router } from 'express'
import { AdminController } from '~/controllers/admin.controller'
import { CheckAuth, CheckRole } from '~/middlewares'
import { UserType } from '~/utils/enums'

const router: Router = express.Router()

router
    .route('/report-client')
    .get(CheckAuth, CheckRole([UserType.ADMIN, UserType.MANAGER, UserType.EMPLOYEE]), AdminController.reportClient)
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
router
    .route('/statistical-total-booking-by-year')
    .get(
        CheckAuth,
        CheckRole([UserType.ADMIN, UserType.MANAGER, UserType.EMPLOYEE]),
        AdminController.totalBookingByYear
    )
router
    .route('/statistical-revenue-seat')
    .get(
        CheckAuth,
        CheckRole([UserType.ADMIN, UserType.MANAGER, UserType.EMPLOYEE]),
        AdminController.statisticalRevenueSeat
    )
router
    .route('/statistical-popular-flight')
    .get(CheckAuth, CheckRole([UserType.ADMIN, UserType.MANAGER, UserType.EMPLOYEE]), AdminController.popularFlight)

export const AdminRoutes = router
