import jwt from 'jsonwebtoken'
import { Request } from 'express'
import { UnauthorizedExeption } from '~/exceptions/UnauthorizedExeption'
import { env } from '~/config/environment.config'
import { redisClient } from '~/config/redis.config'

const token = (req: Request) => {
    const authHeader = req.get('Authorization')
    if (!authHeader) {
        throw new UnauthorizedExeption('Not authorized')
    }

    return authHeader.split(' ')[1] as string
}

const jwtPayload = async (req: Request) => {
    try {
        const tokenHeader = token(req)
        const jwtPayload = jwt.verify(tokenHeader, env.ACCESS_TOKEN_SECRET) as { [key: string]: any }
        const jwtSaved = await redisClient.get(`access_token:${jwtPayload._id}`)
        if (jwtSaved !== tokenHeader) {
            throw new UnauthorizedExeption('Not authorized')
        }
        return jwtPayload
    } catch (e) {
        throw new UnauthorizedExeption('Not authorized')
    }
}

export const TokenContext = { token, jwtPayload }
