import { ErrorResponse } from '~/types/ErrorResponse'
import { AppErrorArgs } from '../types/AppErrorArgs'

export class AppError extends Error {
    public readonly status: number
    public readonly error?: ErrorResponse
    public readonly errors?: ErrorResponse[]

    constructor(args: AppErrorArgs) {
        super(args.message ? args.message : args.error?.message)
        Object.setPrototypeOf(this, new.target.prototype)
        this.status = args.status
        this.error = args.error
        this.errors = args.errors
        Error.captureStackTrace(this)
    }
}
