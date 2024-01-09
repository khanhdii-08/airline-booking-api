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
import {
    ADMIN,
    AIRCRAFT,
    AIRPORT,
    APP,
    AUTH,
    BOOKING,
    CHECK_IN,
    EMPLOYEE,
    FLIGHT,
    PASSENGER,
    PAYMENT,
    SEAT,
    SERVICE_OPTION,
    V1
} from '~/utils/constants'
import { ServiceOptRoutes } from './serviceOption.route'
import { BadRequestException } from '~/exceptions/BadRequestException'
import { BookingRoutes } from './booking.route'
import { PaymentRoutes } from './payment.route'
import { CheckInRoutes } from './checkIn.route'
import { PassengerRoutes } from './passenger.route'
import { AircraftRoutes } from './aircraft.route'
import { EmployeeRoutes } from './employee.route'
import { AdminRoutes } from './admin.route'

const router = express.Router()

/** Set language for i18n  */
router.use((req, res, next) => {
    i18n.setLocale(req.locale)
    next()
})

/** Middleware x-request-source */
router.use((req, res, next) => {
    const requestSource = req.headers['x-request-source']
    if (!requestSource || (requestSource !== 'web' && requestSource !== 'mobile' && requestSource !== 'be')) {
        throw new BadRequestException({ error: { message: 'Invalid x-request-source header' } })
    }
    req.requestSource = requestSource

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
router.use(V1 + SERVICE_OPTION, ServiceOptRoutes)

/** v1/booking */
router.use(V1 + BOOKING, BookingRoutes)

/** v1/payment */
router.use(V1 + PAYMENT, PaymentRoutes)

/** V1/check-in */
router.use(V1 + CHECK_IN, CheckInRoutes)

/** V1 passenger */
router.use(V1 + PASSENGER, PassengerRoutes)

/** V1  aircraft */
router.use(V1 + AIRCRAFT, AircraftRoutes)

/** V1 employee */
router.use(V1 + EMPLOYEE, EmployeeRoutes)

router.use(V1 + ADMIN, AdminRoutes)

router.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    // 1. Log the error or send it to a 3rd party error monitoring software
    logger.error(error)
    next(error)
})

router.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    errorHandler.handleError(error, res)
})

export const apiV1 = router
