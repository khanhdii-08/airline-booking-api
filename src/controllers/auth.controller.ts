import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { HttpStatus } from '~/utils/httpStatus'
import { AuthService } from '~/services/auth.service'
import { RegisterInput } from '~/types/inputs/RegisterInput'
import { TokenContext } from '~/utils/TokenContext'
import { LoginInput } from '~/types/inputs/LoginInput'

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
    const result = await AuthService.userInfo(req.jwtPayload._id)

    return res.status(HttpStatus.OK).json(result)
}

export const AuthController = { register, verify, sendOtp, login, userInfo }
