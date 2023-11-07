import { Request, Response } from 'express'
import { HttpStatus } from '~/utils/httpStatus'
import { FlightService } from '~/services/flight.service'
import { ParamsDictionary } from 'express-serve-static-core'
import { FlightCriteria } from '~/types/criterias/FlightCriteria'
import { FlightInput } from '~/types/inputs/FlightInput'

const search = async (req: Request<ParamsDictionary, any, any, FlightCriteria>, res: Response) => {
    const result = await FlightService.search(req.query)
    return res.status(HttpStatus.OK).json(result)
}

const create = async (req: Request<ParamsDictionary, any, FlightInput>, res: Response) => {
    const flightInput: FlightInput = req.body
    const result = await FlightService.create(flightInput)
    return res.status(HttpStatus.CREATED).json(result)
}

export const FlightController = { search, create }
