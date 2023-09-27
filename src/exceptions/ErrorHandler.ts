import { Response } from 'express'
import { AppError } from './AppError'
import { HttpStatus } from '~/constants/httpStatus'

class ErrorHandler {
    public handleError(error: Error | AppError, response?: Response): void {
        if (response && error instanceof AppError && error.status) {
            this.handleTrustedError(error as AppError, response)
        } else {
            this.handleUntrustedError(error, response)
        }
    }

    private handleTrustedError(error: AppError, response: Response): void {
        response.status(error.status).json({
            status: error.status,
            error: error.error,
            errors: error.errors
        })
    }

    private handleUntrustedError(error: Error, response?: Response): void {
        if (response) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                code: HttpStatus.INTERNAL_SERVER_ERROR,
                error: { message: error.message || 'Internal server error' }
            })
        }
    }
}

export const errorHandler = new ErrorHandler()
