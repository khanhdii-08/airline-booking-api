import express, { Router } from 'express'
import { EmployeeController } from '~/controllers/employee.controller'
import { CheckAuth, CheckRole } from '~/middlewares'
import { UserType } from '~/utils/enums'

const router: Router = express.Router()

router.route('/').post(CheckAuth, CheckRole([UserType.ADMIN, UserType.MANAGER]), EmployeeController.create)
router.route('/info').get(CheckAuth, EmployeeController.employeeInfo)
router.route('/').get(CheckAuth, CheckRole([UserType.ADMIN, UserType.MANAGER]), EmployeeController.employees)
router.route('/:id').get(CheckAuth, CheckRole([UserType.ADMIN, UserType.MANAGER]), EmployeeController.employee)
router.route('/:id').put(CheckAuth, CheckRole([UserType.ADMIN, UserType.MANAGER]), EmployeeController.updateEmployee)
router.route('/:id').patch(CheckAuth, CheckRole([UserType.ADMIN, UserType.MANAGER]), EmployeeController.pending)
router.route('/open/:id').patch(CheckAuth, CheckRole([UserType.ADMIN, UserType.MANAGER]), EmployeeController.open)
router.route('/:id').delete(CheckAuth, CheckRole([UserType.ADMIN, UserType.MANAGER]), EmployeeController.deleteEmployee)

export const EmployeeRoutes = router
