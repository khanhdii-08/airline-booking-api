import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { HttpStatus } from '~/utils/httpStatus'
import { AuthService } from '~/services/auth.service'
import { RegisterInput } from '~/types/inputs/RegisterInput'
import { TokenContext } from '~/utils/TokenContext'
import { LoginInput } from '~/types/inputs/LoginInput'
import { PasswordInput } from '~/types/inputs/PasswordInput'

const register = async (req: Request<ParamsDictionary, any, RegisterInput>, res: Response) => {
    const result = await AuthService.register(req.body)
    return res.status(HttpStatus.CREATED).json(result)
}

const verify = async (req: Request<ParamsDictionary, any, any, { otp: string }>, res: Response) => {
    const otp = req.query.otp
    const jwtPayload = TokenContext.jwtPayload(req)
    const result = await AuthService.verify(jwtPayload._id, req.requestSource, otp)
    return res.status(HttpStatus.OK).json(result)
}

const sendOtp = async (req: Request, res: Response) => {
    const jwtPayload = TokenContext.jwtPayload(req)
    const result = await AuthService.sendOTP({ userId: jwtPayload._id })
    return res.status(HttpStatus.OK).json(result)
}

const login = async (req: Request<ParamsDictionary, any, LoginInput>, res: Response) => {
    const result = await AuthService.login(req.requestSource, req.body)

    return res.status(HttpStatus.OK).json(result)
}

const userInfo = async (req: Request, res: Response) => {
    const language: string = req.headers['accept-language'] || 'en'
    const result = await AuthService.userInfo(req.jwtPayload._id, language)

    return res.status(HttpStatus.OK).json(result)
}

const sendOtpBooking = async (
    req: Request<ParamsDictionary, any, any, { bookingId: string; phoneNumber: string }>,
    res: Response
) => {
    const { bookingId, phoneNumber } = req.query
    const result = await AuthService.sendOtpBooking(bookingId, phoneNumber)

    return res.status(HttpStatus.OK).json(result)
}

const verifyOtpBooking = async (
    req: Request<ParamsDictionary, any, any, { bookingId: string; otp: string }>,
    res: Response
) => {
    const { bookingId, otp } = req.query
    const name = req.params['name']
    const result = await AuthService.verifyOptBooking(name, bookingId, otp)

    return res.status(HttpStatus.OK).json(result)
}

const changePassword = async (req: Request<ParamsDictionary, any, PasswordInput>, res: Response) => {
    const result = await AuthService.changePassword(req.jwtPayload._id, req.body)
    return res.status(HttpStatus.OK).json(result)
}

export const AuthController = {
    register,
    verify,
    sendOtp,
    login,
    userInfo,
    sendOtpBooking,
    verifyOtpBooking,
    changePassword
}
