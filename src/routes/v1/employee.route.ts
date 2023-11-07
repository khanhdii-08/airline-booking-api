import express, { Router } from 'express'
import { EmployeeController } from '~/controllers/employee.controller'
import { CheckAuth, CheckRole } from '~/middlewares'
import { UserType } from '~/utils/enums'

const router: Router = express.Router()

router.route('/').post(CheckAuth, CheckRole([UserType.ADMIN, UserType.MANAGER]), EmployeeController.create)

export const EmployeeRoutes = router
