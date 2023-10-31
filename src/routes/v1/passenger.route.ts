import express, { Router } from 'express'
import { PassengerController } from '~/controllers/passenger.controller'
import { CheckAuth } from '~/middlewares'
import { upload } from '~/middlewares/uploadFile'

const router: Router = express.Router()

router.route('/upload-avatar').patch(upload.single('avatar'), CheckAuth, PassengerController.uploadAvatar)

export const PassengerRoutes = router
