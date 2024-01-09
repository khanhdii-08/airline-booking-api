import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { BadRequestException } from '~/exceptions/BadRequestException'
import { ErrorResponse } from '~/types/ErrorResponse'
import { BookingCriteria } from '~/types/criterias/BookingCriteria'
import validator from 'validator'

const search = async (req: Request<ParamsDictionary, any, any, BookingCriteria>, res: Response, next: NextFunction) => {
    const criteria: BookingCriteria = req.query
    const errors: ErrorResponse[] = []

    if (!criteria.bookingId) {
        if (!criteria.bookingCode || validator.isEmpty(criteria.bookingCode)) {
            errors.push({ message: 'err bookingCode' })
        }
        if (!criteria.firstName) {
            errors.push({ message: 'err firstName' })
        }
        if (!criteria.lastName) {
            errors.push({ message: 'err lastName' })
        }
    }

    if (errors.length > 0) {
        throw new BadRequestException({ errors })
    }

    next()
}

export const BookingValidation = { search }
