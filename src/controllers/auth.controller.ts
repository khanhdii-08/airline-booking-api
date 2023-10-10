import jwt from 'jsonwebtoken'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { HttpStatus } from '~/utils/httpStatus'
import { AuthService } from '~/services/auth.service'
import { RegisterInput } from '~/types/RegisterInput'
import { env } from '~/config/environment.config'
import { TokenContext } from '~/utils/TokenContext'

const register = async (req: Request<ParamsDictionary, any, RegisterInput>, res: Response) => {
    const result = await AuthService.register(req.body)
    return res.status(HttpStatus.CREATED).json(result)
}

const verify = async (req: Request<ParamsDictionary, any, any, { otp: string }>, res: Response) => {
    const otp = req.query.otp

    const token = TokenContext.token(req)
    const jwtPayload = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as { [key: string]: any }

    const result = await AuthService.verify(jwtPayload._id, otp)

    return res.status(HttpStatus.OK).json(result)
}

const sendOtp = async (req: Request, res: Response) => {
    const token = TokenContext.token(req)
    const jwtPayload = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as { [key: string]: any }

    await AuthService.sendOTP({ userId: jwtPayload._id })

    return res.status(HttpStatus.OK).json({ message: 'Success' })
}

export const AuthController = { register, verify, sendOtp }
