import { ErrorResponse } from '~/types/ErrorResponse'
import { HttpStatus } from '~/utils/httpStatus'
import { AppError } from './AppError'

export class UnauthorizedException extends AppError {
    public readonly error?: ErrorResponse
    constructor(message: string) {
        super({
            status: HttpStatus.UNAUTHORIZED,
            message
        })
        this.error = { message }
    }
}
