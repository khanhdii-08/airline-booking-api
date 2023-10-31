import { Request, Response } from 'express'
import { PassengerService } from '~/services/passenger.service'
import { HttpStatus } from '~/utils/httpStatus'

const uploadAvatar = async (req: Request, res: Response) => {
    const result = await PassengerService.uploadAvatar(req.file, req.jwtPayload._id)
    res.status(HttpStatus.OK).json(result)
}

export const PassengerController = { uploadAvatar }
