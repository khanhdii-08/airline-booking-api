import { PassengerInput } from '~/types/inputs/PassengerInput'
import { Request, Response } from 'express'
import { PassengerService } from '~/services/passenger.service'
import { HttpStatus } from '~/utils/httpStatus'
import { ParamsDictionary } from 'express-serve-static-core'
import { PassengerCriteria } from '~/types/criterias/PassengerCriteria'
import { Pagination } from '~/types/Pagination'

const uploadAvatar = async (req: Request, res: Response) => {
    const result = await PassengerService.uploadAvatar(req.file, req.jwtPayload._id)
    res.status(HttpStatus.OK).json(result)
}

const update = async (req: Request<ParamsDictionary, any, PassengerInput>, res: Response) => {
    const passengerInput: PassengerInput = req.body
    const result = await PassengerService.update(req.jwtPayload._id, passengerInput)
    res.status(HttpStatus.OK).json(result)
}

const passengers = async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
    const { page, size, sort, searchText, status, fromDate, toDate } = req.query
    const criteria: PassengerCriteria = { searchText, status, fromDate, toDate }
    const pagination: Pagination = { page, size, sort }
    const result = await PassengerService.passengers(criteria, pagination)
    res.status(HttpStatus.OK).json(result)
}

export const PassengerController = { uploadAvatar, update, passengers }
