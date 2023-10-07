import { HttpStatus } from '~/utils/httpStatus'
import { AppError } from './AppError'
import { ErrorResponse } from '~/types/ErrorResponse'

export class BadRequestException extends AppError {
    public readonly error?: ErrorResponse
    public readonly errors?: ErrorResponse[]
    constructor({ error, errors }: { error?: ErrorResponse; errors?: ErrorResponse[] }) {
        super({
            status: HttpStatus.BAD_REQUEST,
            message: error ? error.message : 'Bad Request'
        })
        this.error = error
        this.errors = errors
    }
}
