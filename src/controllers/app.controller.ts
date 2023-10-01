import { Request, Response } from 'express'
import { HttpStatus } from '~/constants/httpStatus'
import { AppService } from '~/services/app.service'

const getCountries = async (req: Request, res: Response) => {
    const language: string = req.headers['accept-language'] || 'en'
    const result = await AppService.getCountries(language)
    return res.status(HttpStatus.OK).json(result)
}

export const AppController = { getCountries }
