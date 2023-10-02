import express, { NextFunction, Request, Response } from 'express'
import 'express-async-errors'
import { AirportRoutes } from './airport.route'
import { SeatRoutes } from './seatClass.route'
import { errorHandler } from '~/exceptions/ErrorHandler'
import { logger } from '~/config/logger.config'
import i18n from '~/config/i18n.config'
import { AuthRoutes } from './auth.route'
import { AppSettingRoutes } from './appsetting.route'

const router = express.Router()
const root: string = '/v1'

/** Set language for i18n  */
router.use((req, res, next) => {
    i18n.setLocale(req.locale)
    next()
})

/** v1 appsetting */
router.use(root + '/app', AppSettingRoutes)

/** v1 auth */
router.use(root + '/auth', AuthRoutes)

/**  v1/airport */
router.use(root + '/airport', AirportRoutes)

/**  v1/seat */
router.use(root + '/seat', SeatRoutes)

router.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    // 1. Log the error or send it to a 3rd party error monitoring software
    logger.error(error)
    next(error)
})

router.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    errorHandler.handleError(error, res)
})

export const apiV1 = router
