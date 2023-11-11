import { Pagination } from '~/types/Pagination'
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

const flights = async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
    const { sourceAirportId, destinationAirportId, departureDate, arrivalDate, page, size, sort } = req.query
    const pagination: Pagination = { page, size, sort }
    const criteria: FlightCriteria = { sourceAirportId, destinationAirportId, departureDate, arrivalDate }
    const status = req.params['status']
    const result = await FlightService.flights(status, criteria, pagination)

    return res.status(HttpStatus.OK).json(result)
}

const updateFlight = async (req: Request<ParamsDictionary, any, FlightInput>, res: Response) => {
    const flightInput: FlightInput = req.body
    const id: string = req.params['id']
    const result = await FlightService.updateFlight(id, flightInput)

    return res.status(HttpStatus.OK).json(result)
}

export const FlightController = { search, create, flights, updateFlight }
