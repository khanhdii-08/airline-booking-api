import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { HttpStatus } from '~/constants/httpStatus'
import { AuthService } from '~/services/auth.service'
import { RegisterInput } from '~/types/RegisterInput'

const register = async (req: Request<ParamsDictionary, any, RegisterInput>, res: Response) => {
    const result = await AuthService.register(req.body)
    return res.status(HttpStatus.CREATED).json({ access_token: result })
}

export const AuthController = { register }
