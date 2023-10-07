import { Request, Response } from 'express'
import { logger } from '~/config/logger.config'
import { SeatService } from '~/services'

const getAllSeat = async (req: Request, res: Response) => {
    try {
        const result = await SeatService.getAllSeat()
        return res.status(200).json(result)
    } catch (error) {
        logger.error(error)
    }
}

export const SeatController = { getAllSeat }
