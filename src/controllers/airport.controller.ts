import { Request, Response } from 'express'
import { AirPortService } from '~/services'

const getAllAirPort = async (req: Request, res: Response) => {
    const airports = await AirPortService.getAllAirPort()
    res.status(200).json(airports)
}

export const AirportController = { getAllAirPort }
