import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import validator from 'validator'
import i18n from '~/config/i18n'
import { HttpStatus } from '~/utils/httpStatus'
import { User } from '~/entities'
import { AppError } from '~/exceptions/AppError'
import { ValidationException } from '~/exceptions/ValidationException'
import { MessageKeys } from '~/messages/MessageKeys'
import { RegisterInput } from '~/types/RegisterInput'
import { Gender } from '~/utils/enums'
import { CountryEn, CountryVi } from '~/utils/enums/country.enum'

const register = async (req: Request<ParamsDictionary, any, RegisterInput>, res: Response, next: NextFunction) => {
    const { phoneNumber, email, firstName, dateOfBirth, lastName, country, gender, password } = req.body

    if (Object.keys(Gender).indexOf(gender) === -1)
        throw new ValidationException(
            i18n.__(MessageKeys.E_ENUM_V000_INVALID, req.locale === 'vi' ? 'giới tính' : 'gender')
        )
    else if (firstName === undefined || validator.isEmpty(firstName))
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V000_FIRSTNAMEBLANK))
    else if (!validator.isLength(firstName, { max: 60 }))
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V001_FIRSTNAMETOOLONG))
    else if (lastName === undefined || validator.isEmpty(lastName))
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V002_LASTNAMEBLANK))
    else if (!validator.isLength(lastName, { max: 60 }))
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V003_LASTNAMETOOLONG))
    else if (dateOfBirth === undefined || validator.isEmpty(dateOfBirth))
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V004_DATEOFBIRTHBLANK))
    else if (!validator.isDate(dateOfBirth))
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V005_DATEOFBIRTHCORRECTFORMAT))
    else if (country === undefined || validator.isEmpty(country))
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V006_COUNTRYBLANK))
    else if (Object.keys(CountryEn).indexOf(country) === -1 || Object.keys(CountryVi).indexOf(country) === -1)
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V007_COUNTRYEXIST))
    else if (phoneNumber === undefined || validator.isEmpty(phoneNumber))
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V008_PHONENUMBERBLANK))
    else if (!validator.isMobilePhone(phoneNumber, 'vi-VN'))
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V009_PHONENUMBERCORRECTFORMAT))
    else if (email !== undefined && !validator.isEmpty(email)) {
        if (!validator.isEmail(email))
            throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V011_EMAILCORRECTFORMAT))
    } else if (password === undefined || validator.isEmpty(password))
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V012_PASSWORDBLANK))
    else if (!validator.isLength(password, { min: 8 }))
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V013_PASSWORDLENGTH))
    else if (!validator.isLength(password, { max: 60 }))
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V014_PASSWORDTOOLONG))

    if (email !== undefined && !validator.isEmpty(email)) {
        const existingUser = await User.findOne({ where: { phoneNumber } })
        if (existingUser) {
            throw new AppError({
                status: HttpStatus.CONFLICT,
                error: { message: i18n.__(MessageKeys.E_PASSENGER_B000_PHONEDUPLICATED) }
            })
        } else {
            const existingUser = await User.findOne({ where: { email } })
            if (existingUser) {
                throw new AppError({
                    status: HttpStatus.CONFLICT,
                    error: { message: i18n.__(MessageKeys.E_PASSENGER_B001_EMAILDUPLICATED) }
                })
            }
        }
    } else {
        const existingUser = await User.findOne({ where: { phoneNumber } })
        if (existingUser) {
            throw new AppError({
                status: HttpStatus.CONFLICT,
                error: { message: i18n.__(MessageKeys.E_PASSENGER_B000_PHONEDUPLICATED) }
            })
        }
    }

    next()
}

export const AuthValidation = { register }
