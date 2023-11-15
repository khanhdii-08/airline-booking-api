import { Request, Response } from 'express'
import { AdminService } from '~/services/admin.service'
import { HttpStatus } from '~/utils/httpStatus'

const reportClient = async (req: Request, res: Response) => {
    const result = await AdminService.reportClient()
    return res.status(HttpStatus.OK).json(result)
}

const bookingsLimitTen = async (req: Request, res: Response) => {
    const result = await AdminService.bookingsLimitTen()
    return res.status(HttpStatus.OK).json(result)
}

export const AdminController = { reportClient, bookingsLimitTen }
