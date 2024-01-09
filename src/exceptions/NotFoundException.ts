import { HttpStatus } from '~/utils/httpStatus'
import { AppError } from './AppError'
import { ErrorResponse } from '~/types/ErrorResponse'

export class NotFoundException extends AppError {
    public readonly error?: ErrorResponse
    constructor(errorResponse: ErrorResponse) {
        super({
            status: HttpStatus.NOT_FOUND,
            message: errorResponse.message
        })
        this.error = errorResponse
    }
}
