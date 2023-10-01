import express, { Router } from 'express'
import { AppController } from '~/controllers/app.controller'

const router: Router = express.Router()

router.route('/countries').get(AppController.getCountries)

export const AppSettingRoutes = router
