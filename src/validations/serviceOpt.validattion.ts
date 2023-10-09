import { Request, Response, NextFunction } from 'express'
import validator from 'validator'
import { ErrorResponse } from '~/types/ErrorResponse'
import i18n from '~/config/i18n.config'
import { MessageKeys } from '~/messages/MessageKeys'
import { BadRequestException } from '~/exceptions/BadRequestException'
import { Airline, Flight, Seat } from '~/entities'
import { NotFoundException } from '~/exceptions/NotFoundException'

const serviceOpt = async (req: Request, res: Response, next: NextFunction) => {
    const { flightId, airlineId, seatId } = req.query

    const errors: ErrorResponse[] = []

    if (flightId === undefined || validator.isEmpty(flightId.toString()))
        errors.push({ message: i18n.__(MessageKeys.E_EXPRESS_V000_ISEMPTY, 'flightId') })

    if (airlineId === undefined || validator.isEmpty(airlineId.toString()))
        errors.push({ message: i18n.__(MessageKeys.E_EXPRESS_V000_ISEMPTY, 'airlineId') })

    if (seatId === undefined || validator.isEmpty(seatId.toString()))
        errors.push({ message: i18n.__(MessageKeys.E_EXPRESS_V000_ISEMPTY, 'seatId') })

    if (errors.length > 0) {
        throw new BadRequestException({ errors })
    }

    const flight = await Flight.findOneBy({ id: flightId as string })
    if (flight === undefined || flight === null) {
        throw new NotFoundException({ message: i18n.__(MessageKeys.E_FLIGHT_R000_NOTFOUND) })
    }

    const airline = await Airline.findOneBy({ id: airlineId as string })
    if (airline === undefined || airline === null) {
        throw new NotFoundException({ message: i18n.__(MessageKeys.E_AIRLINE_R000_AIRLINE) })
    }

    const seat = await Seat.findOneBy({ id: seatId as string })
    if (seat === undefined || seat === null) {
        throw new NotFoundException({ message: i18n.__(MessageKeys.E_SEAT_R000_NOTFOUND) })
    }

    next()
}

export const ServiceOptValidation = { serviceOpt }
