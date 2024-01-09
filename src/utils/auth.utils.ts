import jwt from 'jsonwebtoken'
import { env } from '~/config/environment.config'
import { JwtPayload } from '~/types/JwtPayload'

export const createToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, { expiresIn: env.JWT_EXPRIED_ACCESS_TOKEN })
}

export const createRefreshToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, { expiresIn: env.JWT_EXPRIED_REFRESH_TOKEN })
}
