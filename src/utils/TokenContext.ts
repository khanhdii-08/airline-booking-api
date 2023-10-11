import jwt from 'jsonwebtoken'
import { Request } from 'express'
import { UnauthorizedExeption } from '~/exceptions/UnauthorizedExeption'
import { env } from '~/config/environment.config'
import { JwtPayload } from '~/types/JwtPayload'

const token = (req: Request) => {
    const authHeader = req.get('Authorization')
    if (!authHeader) {
        throw new UnauthorizedExeption('Not authorized2')
    }

    return authHeader.split(' ')[1] as string
}

const jwtPayload = (req: Request) => {
    // try {
    const jwtPayload = jwt.verify(token(req), env.ACCESS_TOKEN_SECRET) as { [key: string]: any }
    ;['iat', 'exp'].forEach((keyToRemove) => delete jwtPayload[keyToRemove])
    return jwtPayload as JwtPayload
    // } catch (e) {
    //     throw new UnauthorizedExeption('Not authorized1')
    // }
}

export const TokenContext = { token, jwtPayload }
