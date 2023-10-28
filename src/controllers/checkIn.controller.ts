import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { CheckInService } from '~/services/checkIn.service'
import { CheckInInput } from '~/types/inputs/CheckInInput'
import { HttpStatus } from '~/utils/httpStatus'

const checkIn = async (req: Request<ParamsDictionary, any, CheckInInput>, res: Response) => {
    const checkInInput: CheckInInput = req.body
    const result = await CheckInService.checkIn(checkInInput)

    return res.status(HttpStatus.CREATED).json(result)
}

export const CheckInController = { checkIn }
