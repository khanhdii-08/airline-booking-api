import { JwtPayload } from '~/types/JwtPayload'

declare global {
    namespace Express {
        export interface Request {
            requestSource: string
            jwtPayload: JwtPayload
        }
    }
}
