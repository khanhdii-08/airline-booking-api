import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { FlightCriteria } from '~/types/criterias/FlightCriteria'
import validator from 'validator'
import { ErrorResponse } from '~/types/ErrorResponse'
import i18n from '~/config/i18n.config'
import { MessageKeys } from '~/messages/MessageKeys'
import { BadRequestException } from '~/exceptions/BadRequestException'

const search = (req: Request<ParamsDictionary, any, any, FlightCriteria>, res: Response, next: NextFunction) => {
    const { sourceAirportId, destinationAirportId, departureDate, seatId, numAdults, numChildren, numInfants } =
        req.query

    const errors: ErrorResponse[] = []

    if (sourceAirportId === undefined || validator.isEmpty(sourceAirportId))
        errors.push({ message: i18n.__(MessageKeys.E_EXPRESS_V000_ISEMPTY, 'sourceAirportId') })

    if (destinationAirportId === undefined || validator.isEmpty(destinationAirportId))
        errors.push({ message: i18n.__(MessageKeys.E_EXPRESS_V000_ISEMPTY, 'destinationAirportId') })

    if (departureDate === undefined || (departureDate !== undefined && validator.isEmpty(departureDate.toString())))
        errors.push({ message: i18n.__(MessageKeys.E_EXPRESS_V000_ISEMPTY, 'departureDate') })

    if (departureDate !== undefined && !validator.isDate(departureDate.toString()))
        errors.push({ message: i18n.__(MessageKeys.E_EXPRESS_V003_NOTDATE, 'departureDate') })

    if (seatId === undefined || validator.isEmpty(seatId))
        errors.push({ message: i18n.__(MessageKeys.E_EXPRESS_V000_ISEMPTY, 'seatId') })

    if (numAdults === undefined || validator.isEmpty(numAdults.toString()))
        errors.push({ message: i18n.__(MessageKeys.E_EXPRESS_V000_ISEMPTY, 'numAdults') })

    if (Number(numAdults) <= 0) errors.push({ message: i18n.__(MessageKeys.E_EXPRESS_V004_ISMIN, 'numAdults', '1') })

    if (Number(numAdults) > 9) errors.push({ message: i18n.__(MessageKeys.E_EXPRESS_V005_ISMAX, 'numAdults', '9') })

    if (numChildren === undefined || validator.isEmpty(numChildren.toString()))
        errors.push({ message: i18n.__(MessageKeys.E_EXPRESS_V000_ISEMPTY, 'numAdults') })

    if (Number(numChildren) < 0) errors.push({ message: i18n.__(MessageKeys.E_EXPRESS_V004_ISMIN, 'numChildren', '0') })
    if (Number(numChildren) > 9) errors.push({ message: i18n.__(MessageKeys.E_EXPRESS_V005_ISMAX, 'numAdults', '9') })

    if (numInfants === undefined || validator.isEmpty(numInfants.toString()))
        errors.push({ message: i18n.__(MessageKeys.E_EXPRESS_V000_ISEMPTY, 'numAdults') })

    if (Number(numInfants) < 0) errors.push({ message: i18n.__(MessageKeys.E_EXPRESS_V004_ISMIN, 'numInfants', '0') })
    if (Number(numInfants) > 9) errors.push({ message: i18n.__(MessageKeys.E_EXPRESS_V005_ISMAX, 'numInfants', '9') })

    if (
        Number(numAdults) >= 0 &&
        Number(numAdults) <= 9 &&
        Number(numChildren) >= 0 &&
        Number(numChildren) <= 9 &&
        Number(numInfants) >= 0 &&
        Number(numInfants) <= 9
    ) {
        if (Number(numAdults) + Number(numChildren) > 9)
            errors.push({ message: i18n.__(MessageKeys.E_EXPRESS_V005_ISMAX, 'numAdults + numChildren', '9') })

        if (Number(numAdults) + Number(numChildren) < Number(numInfants))
            errors.push({ message: i18n.__(MessageKeys.E_EXPRESS_V005_ISMAX, 'numInfants', 'numAdults + numChildren') })
    }

    if (errors.length > 0) {
        throw new BadRequestException({ errors })
    }
    next()
}

export const FlightValidation = { search }
