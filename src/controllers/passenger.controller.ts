import { PassengerInput } from '~/types/inputs/PassengerInput'
import { Request, Response } from 'express'
import { PassengerService } from '~/services/passenger.service'
import { HttpStatus } from '~/utils/httpStatus'
import { ParamsDictionary } from 'express-serve-static-core'

const uploadAvatar = async (req: Request, res: Response) => {
    const result = await PassengerService.uploadAvatar(req.file, req.jwtPayload._id)
    res.status(HttpStatus.OK).json(result)
}

const update = async (req: Request<ParamsDictionary, any, PassengerInput>, res: Response) => {
    const passengerInput: PassengerInput = req.body
    const result = await PassengerService.update(req.jwtPayload._id, passengerInput)
    res.status(HttpStatus.OK).json(result)
}

export const PassengerController = { uploadAvatar, update }
