import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { BookingService } from '~/services/booking.service'
import { BookingInput } from '~/types/BookingInput'
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

export const BookingController = { booking }
