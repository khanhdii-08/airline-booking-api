import { ErrorResponse } from '~/types/ErrorResponse'

export interface AppErrorArgs {
    status: number
    message?: string
    error?: ErrorResponse
    errors?: ErrorResponse[]
}
