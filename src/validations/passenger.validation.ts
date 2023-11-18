import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { PassengerInput } from '~/types/inputs/PassengerInput'
import validator from 'validator'
import { ValidationException } from '~/exceptions/ValidationException'
import i18n from '~/config/i18n.config'
import { MessageKeys } from '~/messages/MessageKeys'
import { CountryEn, CountryVi, Gender } from '~/utils/enums'
import { User } from '~/entities'
import { HttpStatus } from '~/utils/httpStatus'
import { AppError } from '~/exceptions/AppError'

const create = async (req: Request<ParamsDictionary, any, PassengerInput>, res: Response, next: NextFunction) => {
    const { firstName, lastName, dateOfBirth, country, gender, phoneNumber, email, password, idCard } = req.body

    if (Object.keys(Gender).indexOf(gender) === -1) {
        throw new ValidationException(
            i18n.__(MessageKeys.E_ENUM_V000_INVALID, req.locale === 'vi' ? 'giới tính' : 'gender')
        )
    } else if (!firstName || validator.isEmpty(firstName)) {
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V000_FIRSTNAMEBLANK))
    } else if (!validator.isLength(firstName, { max: 60 })) {
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V001_FIRSTNAMETOOLONG))
    } else if (!lastName || validator.isEmpty(lastName)) {
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V002_LASTNAMEBLANK))
    } else if (!validator.isLength(lastName, { max: 60 })) {
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V003_LASTNAMETOOLONG))
    } else if (!dateOfBirth || validator.isEmpty(dateOfBirth)) {
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V004_DATEOFBIRTHBLANK))
    } else if (!validator.isDate(dateOfBirth)) {
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V005_DATEOFBIRTHCORRECTFORMAT))
    } else if (!country || validator.isEmpty(country)) {
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V006_COUNTRYBLANK))
    } else if (Object.keys(CountryEn).indexOf(country) === -1 || Object.keys(CountryVi).indexOf(country) === -1) {
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V007_COUNTRYEXIST))
    } else if (!phoneNumber || validator.isEmpty(phoneNumber)) {
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V008_PHONENUMBERBLANK))
    } else if (!validator.isMobilePhone(phoneNumber, 'vi-VN')) {
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V009_PHONENUMBERCORRECTFORMAT))
    } else if (!idCard || validator.isEmpty(idCard)) {
        throw new ValidationException('idCard')
    } else if (email && !validator.isEmpty(email)) {
        if (!validator.isEmail(email))
            throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V011_EMAILCORRECTFORMAT))
    } else if (!password || validator.isEmpty(password)) {
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V012_PASSWORDBLANK))
    } else if (!validator.isLength(password, { min: 8 })) {
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V013_PASSWORDLENGTH))
    } else if (!validator.isLength(password, { max: 60 })) {
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V014_PASSWORDTOOLONG))
    }

    if (email && !validator.isEmpty(email)) {
        const existingUser = await User.findOneBy({ phoneNumber, isActived: true })
        if (existingUser) {
            throw new AppError({
                status: HttpStatus.CONFLICT,
                error: { message: i18n.__(MessageKeys.E_PASSENGER_B000_PHONEDUPLICATED) }
            })
        } else {
            const existingUser = await User.findOneBy({ email, isActived: true })
            if (existingUser) {
                throw new AppError({
                    status: HttpStatus.CONFLICT,
                    error: { message: i18n.__(MessageKeys.E_PASSENGER_B001_EMAILDUPLICATED) }
                })
            }
        }

        const existingUserNotAcitive = await User.findOneBy({ phoneNumber, isActived: false })
        if (existingUserNotAcitive) {
            throw new AppError({
                status: HttpStatus.CONFLICT,
                error: { message: i18n.__(MessageKeys.E_PASSENGER_B003_PHONEDUPLICATEDNOTACTIVE) }
            })
        } else {
            const existingUserNotAcitive = await User.findOneBy({ email, isActived: false })
            if (existingUserNotAcitive) {
                throw new AppError({
                    status: HttpStatus.CONFLICT,
                    error: { message: i18n.__(MessageKeys.E_PASSENGER_B004_EMAILDUPLICATEDNOTACTIVE) }
                })
            }
        }
    } else {
        const existingUser = await User.findOneBy({ phoneNumber, isActived: true })
        if (existingUser) {
            throw new AppError({
                status: HttpStatus.CONFLICT,
                error: { message: i18n.__(MessageKeys.E_PASSENGER_B000_PHONEDUPLICATED) }
            })
        }
        const existingUserNotAcitive = await User.findOneBy({ phoneNumber, isActived: false })
        if (existingUserNotAcitive) {
            throw new AppError({
                status: HttpStatus.CONFLICT,
                error: { message: i18n.__(MessageKeys.E_PASSENGER_B003_PHONEDUPLICATEDNOTACTIVE) }
            })
        }
    }

    next()
}

export const PassengerValidation = { create }
