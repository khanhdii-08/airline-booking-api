import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { AircraftService } from '~/services/aircraft.service'
import { AircraftCriteria } from '~/types/criterias/AircraftCriteria'
import { HttpStatus } from '~/utils/httpStatus'

const aircrafts = async (req: Request<ParamsDictionary, any, any, AircraftCriteria>, res: Response) => {
    const criteria: AircraftCriteria = req.query
    const result = await AircraftService.aircrafts(criteria)
    return res.status(HttpStatus.OK).json(result)
}

export const AircraftController = { aircrafts }
