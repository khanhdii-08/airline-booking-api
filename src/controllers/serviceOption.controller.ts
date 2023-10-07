import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ServiceOptService } from '~/services'

const getAllServiceOpt = async (
    req: Request<ParamsDictionary, any, any, { airlineId: string; seatId: string }>,
    res: Response
) => {
    const { airlineId, seatId } = req.query

    const result = await ServiceOptService.getAllServiceOpt(airlineId, seatId)
    return res.status(200).json(result)
}

export const ServiceOptController = { getAllServiceOpt }
