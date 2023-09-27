import { ErrorResponse } from '~/types/ErrorResponse'
import { HttpStatus } from '~/constants/httpStatus'
import { AppError } from './AppError'

export class ValidationException extends AppError {
    public readonly error?: ErrorResponse
    constructor(message: string) {
        super({
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            message
        })
        this.error = { message }
    }
}
