import express, { NextFunction, Request, Response } from 'express'
import 'express-async-errors'
import { AirportRoutes } from './airport.route'
import { SeatRoutes } from './seatClass.route'
import { errorHandler } from '~/exceptions/ErrorHandler'
import { logger } from '~/config/logger.config'
import i18n from '~/config/i18n.config'
import { AuthRoutes } from './auth.route'
import { AppSettingRoutes } from './appsetting.route'
import { FlightRoutes } from './flight.route'
import { AIRPORT, APP, AUTH, FLIGHT, SEAT, SERVICE_OPTION, V1 } from '~/utils/constants'
import { ServiceOpt } from './serviceOption.route'

const router = express.Router()

/** Set language for i18n  */
router.use((req, res, next) => {
    i18n.setLocale(req.locale)
    next()
})

/** v1 appsetting */
router.use(V1 + APP, AppSettingRoutes)

/** v1 auth */
router.use(V1 + AUTH, AuthRoutes)

/**  v1/airport */
router.use(V1 + AIRPORT, AirportRoutes)

/**  v1/seat */
router.use(V1 + SEAT, SeatRoutes)

/** v1/flight */
router.use(V1 + FLIGHT, FlightRoutes)

/** v1/service-option */
router.use(V1 + SERVICE_OPTION, ServiceOpt)

router.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    // 1. Log the error or send it to a 3rd party error monitoring software
    logger.error(error)
    next(error)
})

router.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    errorHandler.handleError(error, res)
})

export const apiV1 = router
