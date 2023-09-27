import { ErrorResponse } from '~/types/ErrorResponse'
import { HttpStatus } from '~/constants/httpStatus'
import { AppError } from './AppError'

export class UnauthorizedExeption extends AppError {
    public readonly error?: ErrorResponse

    constructor(errorResponse: ErrorResponse) {
        super({ status: HttpStatus.UNAUTHORIZED, message: errorResponse.message })
        this.error = errorResponse
    }
}
