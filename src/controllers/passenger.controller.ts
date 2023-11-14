import { PassengerInput } from '~/types/inputs/PassengerInput'
import { Request, Response } from 'express'
import { PassengerService } from '~/services/passenger.service'
import { HttpStatus } from '~/utils/httpStatus'
import { ParamsDictionary } from 'express-serve-static-core'
import { PassengerCriteria } from '~/types/criterias/PassengerCriteria'
import { Pagination } from '~/types/Pagination'
import { Status } from '~/utils/enums'

const uploadAvatar = async (req: Request, res: Response) => {
    const result = await PassengerService.uploadAvatar(req.file, req.jwtPayload._id)
    return res.status(HttpStatus.OK).json(result)
}

const update = async (req: Request<ParamsDictionary, any, PassengerInput>, res: Response) => {
    const passengerInput: PassengerInput = req.body
    const result = await PassengerService.update(req.jwtPayload._id, passengerInput)
    return res.status(HttpStatus.OK).json(result)
}

const passengers = async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
    const { page, size, sort, searchText, status, fromDate, toDate } = req.query
    const criteria: PassengerCriteria = { searchText, status, fromDate, toDate }
    const pagination: Pagination = { page, size, sort }
    const result = await PassengerService.passengers(criteria, pagination)
    return res.status(HttpStatus.OK).json(result)
}

const passenger = async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
    const id = req.params['id']
    const result = await PassengerService.passenger(id)
    return res.status(HttpStatus.OK).json(result)
}

const updateStatus = async (req: Request<ParamsDictionary, any, any, { status: Status }>, res: Response) => {
    const id = req.params['id']
    const status: Status = req.query.status
    const result = await PassengerService.updateStatus(id, status)
    return res.status(HttpStatus.OK).json(result)
}

const updatePassenger = async (req: Request<ParamsDictionary, any, PassengerInput>, res: Response) => {
    const id = req.params['id']
    const passengerInput: PassengerInput = req.body
    const result = await PassengerService.updatePassenger(id, passengerInput)
    return res.status(HttpStatus.OK).json(result)
}

export const PassengerController = { uploadAvatar, update, passengers, passenger, updateStatus, updatePassenger }
