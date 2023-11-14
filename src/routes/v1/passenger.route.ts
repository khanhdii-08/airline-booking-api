import express, { Router } from 'express'
import { PassengerController } from '~/controllers/passenger.controller'
import { CheckAuth, CheckRole } from '~/middlewares'
import { upload } from '~/middlewares/uploadFile'
import { UserType } from '~/utils/enums'

const router: Router = express.Router()

router.route('/upload-avatar').patch(upload.single('avatar'), CheckAuth, PassengerController.uploadAvatar)
router.route('/update').put(CheckAuth, PassengerController.update)
router
    .route('/')
    .get(CheckAuth, CheckRole([UserType.EMPLOYEE, UserType.MANAGER, UserType.ADMIN]), PassengerController.passengers)
router
    .route('/:id')
    .get(CheckAuth, CheckRole([UserType.EMPLOYEE, UserType.MANAGER, UserType.ADMIN]), PassengerController.passenger)
router
    .route('/:id')
    .patch(
        CheckAuth,
        CheckRole([UserType.EMPLOYEE, UserType.MANAGER, UserType.ADMIN]),
        PassengerController.updateStatus
    )
router
    .route('/:id')
    .put(
        CheckAuth,
        CheckRole([UserType.EMPLOYEE, UserType.MANAGER, UserType.ADMIN]),
        PassengerController.updatePassenger
    )

export const PassengerRoutes = router
