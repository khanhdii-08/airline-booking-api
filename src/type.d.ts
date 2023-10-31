import { JwtPayload } from '~/types/JwtPayload'
import { MulterFile } from './types/MulterFile'

declare global {
    namespace Express {
        export interface Request {
            requestSource: string
            jwtPayload: JwtPayload
            file: MulterFile
        }
    }
}
