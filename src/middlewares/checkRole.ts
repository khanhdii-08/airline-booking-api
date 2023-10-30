import { UnauthorizedException } from '~/exceptions/UnauthorizedException'
import { UserType } from './../utils/enums/userType.enum'
import { Request, Response, NextFunction } from 'express'

export const CheckRole = (roles: UserType[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { role } = req.jwtPayload

        if (roles.indexOf(role) === -1) {
            throw new UnauthorizedException('Unauthorized - Insufficient user rights')
        }
        return next()
    }
}
