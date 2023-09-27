import express, { NextFunction, Request, Response } from 'express'
import 'express-async-errors'
import { AirportRoutes } from './airport.route'
import { SeatRoutes } from './seatClass.route'
import { errorHandler } from '~/exceptions/ErrorHandler'
import { logger } from '~/config/logger'
import i18n from '~/config/i18n'

const router = express.Router()
const root: string = '/v1'

router.use((req, res, next) => {
    i18n.setLocale(req.locale)
    next()
})

/** v1 auth */

/**  v1/airport */
router.use(root + '/airport', AirportRoutes)

/**  v1/seat */
router.use(root + '/seat', SeatRoutes)

router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    // 1. Log the error or send it to a 3rd party error monitoring software
    logger.error(err)
    next(err)
})

router.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    errorHandler.handleError(error, res)
})

export const apiV1 = router
