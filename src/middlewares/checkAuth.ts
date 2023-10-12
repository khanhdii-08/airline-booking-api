import { Request, Response, NextFunction } from 'express'
import { redisClient } from '~/config/redis.config'
import { UnauthorizedExeption } from '~/exceptions/UnauthorizedExeption'

import { TokenContext } from '~/utils/TokenContext'
import { ACCESS_TOKEN_KEY } from '~/utils/constants'

export const CheckAuth = async (req: Request, res: Response, next: NextFunction) => {
    const token = TokenContext.token(req)
    const jwtPayload = TokenContext.jwtPayload(req)
    const tokenInRedis = await redisClient.get(`${ACCESS_TOKEN_KEY}:${req.requestSource}:${jwtPayload._id}`)

    if (tokenInRedis !== token) throw new UnauthorizedExeption('Not authorized')

    req.jwtPayload = jwtPayload

    return next()
}
