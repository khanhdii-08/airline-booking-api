import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import validator from 'validator'
import i18n from '~/config/i18n.config'
import { HttpStatus } from '~/utils/httpStatus'
import { User } from '~/entities'
import { AppError } from '~/exceptions/AppError'
import { ValidationException } from '~/exceptions/ValidationException'
import { MessageKeys } from '~/messages/MessageKeys'
import { RegisterInput } from '~/types/inputs/RegisterInput'
import { Gender } from '~/utils/enums'
import { CountryEn, CountryVi } from '~/utils/enums/country.enum'
import { BadRequestException } from '~/exceptions/BadRequestException'
import { TokenContext } from '~/utils/TokenContext'
import { UnauthorizedException } from '~/exceptions/UnauthorizedException'
import { redisClient } from '~/config/redis.config'
import { OTP_KEY } from '~/utils/constants'

const register = async (req: Request<ParamsDictionary, any, RegisterInput>, res: Response, next: NextFunction) => {
    const { phoneNumber, email, firstName, dateOfBirth, lastName, country, gender, password } = req.body

    if (Object.keys(Gender).indexOf(gender) === -1)
        throw new ValidationException(
            i18n.__(MessageKeys.E_ENUM_V000_INVALID, req.locale === 'vi' ? 'giới tính' : 'gender')
        )
    else if (!firstName || validator.isEmpty(firstName))
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V000_FIRSTNAMEBLANK))
    else if (!validator.isLength(firstName, { max: 60 }))
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V001_FIRSTNAMETOOLONG))
    else if (!lastName || validator.isEmpty(lastName))
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V002_LASTNAMEBLANK))
    else if (!validator.isLength(lastName, { max: 60 }))
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V003_LASTNAMETOOLONG))
    else if (!dateOfBirth || validator.isEmpty(dateOfBirth))
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V004_DATEOFBIRTHBLANK))
    else if (!validator.isDate(dateOfBirth))
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V005_DATEOFBIRTHCORRECTFORMAT))
    else if (!country || validator.isEmpty(country))
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V006_COUNTRYBLANK))
    else if (Object.keys(CountryEn).indexOf(country) === -1 || Object.keys(CountryVi).indexOf(country) === -1)
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V007_COUNTRYEXIST))
    else if (!phoneNumber || validator.isEmpty(phoneNumber))
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V008_PHONENUMBERBLANK))
    else if (!validator.isMobilePhone(phoneNumber, 'vi-VN'))
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V009_PHONENUMBERCORRECTFORMAT))
    else if (email && !validator.isEmpty(email)) {
        if (!validator.isEmail(email))
            throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V011_EMAILCORRECTFORMAT))
    } else if (!password || validator.isEmpty(password))
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V012_PASSWORDBLANK))
    else if (!validator.isLength(password, { min: 8 }))
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V013_PASSWORDLENGTH))
    else if (!validator.isLength(password, { max: 60 }))
        throw new ValidationException(i18n.__(MessageKeys.E_PASSENGER_V014_PASSWORDTOOLONG))

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
    } else {
        const existingUser = await User.findOneBy({ phoneNumber, isActived: true })
        if (existingUser) {
            throw new AppError({
                status: HttpStatus.CONFLICT,
                error: { message: i18n.__(MessageKeys.E_PASSENGER_B000_PHONEDUPLICATED) }
            })
        }
    }

    next()
}

const verify = async (req: Request<ParamsDictionary, any, any, { otp: string }>, res: Response, next: NextFunction) => {
    const { otp } = req.query

    if (!otp || validator.isEmpty(otp)) {
        throw new BadRequestException({ error: { message: 'ss' } })
    }

    const jwtPayload = TokenContext.jwtPayload(req)
    await User.findOneByOrFail({ id: jwtPayload._id }).catch(() => new UnauthorizedException('dđ'))

    next()
}

const sendOTP = async (req: Request, res: Response, next: NextFunction) => {
    const jwtPayload = TokenContext.jwtPayload(req)
    const savedOtp = await redisClient.get(`${OTP_KEY}:${jwtPayload._id}`)
    if (!savedOtp) {
        throw new BadRequestException({ error: { message: 'dsds' } })
    }

    next()
}

export const AuthValidation = { register, verify, sendOTP }
