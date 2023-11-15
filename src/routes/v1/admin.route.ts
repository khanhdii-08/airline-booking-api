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

export const AdminRoutes = router
