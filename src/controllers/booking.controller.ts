import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { BookingService } from '~/services/booking.service'
import { BookingCriteria } from '~/types/criterias/BookingCriteria'
import { BookingInput } from '~/types/inputs/BookingInput'
import { TokenContext } from '~/utils/TokenContext'
import { HttpStatus } from '~/utils/httpStatus'

const booking = async (req: Request<ParamsDictionary, any, BookingInput>, res: Response) => {
    const bookingInput: BookingInput = req.body

    const authHeader = req.get('Authorization')
    if (authHeader) {
        bookingInput.userId = TokenContext.jwtPayload(req)._id
    }

    const result = await BookingService.booking(req.body)
    return res.status(HttpStatus.CREATED).json(result)
}

const search = async (req: Request<ParamsDictionary, any, any, BookingCriteria>, res: Response) => {
    const bookingCriteria: BookingCriteria = req.query

    const result = await BookingService.bookingDetail(bookingCriteria)
    return res.status(HttpStatus.OK).json(result)
}

const bookingCancel = async (req: Request<ParamsDictionary, any, BookingInput>, res: Response) => {
    const bookingInput = req.body
    const result = await BookingService.bookingCancel(bookingInput)
    return res.status(HttpStatus.OK).json(result)
}

const updateBooking = async (req: Request<ParamsDictionary, any, BookingInput>, res: Response) => {
    const bookingInput = req.body
    const result = await BookingService.updateBooking(bookingInput)
    return res.status(HttpStatus.OK).json(result)
}

const bookingAddService = async (req: Request<ParamsDictionary, any, BookingInput>, res: Response) => {
    const bookingInput = req.body
    const result = await BookingService.bookingAddService(bookingInput)
    return res.status(HttpStatus.OK).json(result)
}

export const BookingController = { booking, search, bookingCancel, updateBooking, bookingAddService }
