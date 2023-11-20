import { StatisticalCriteria } from './../types/criterias/StatisticalCriteria'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
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

const revenueInTwoYear = async (req: Request, res: Response) => {
    const result = await AdminService.revenueInTwoYear()
    return res.status(HttpStatus.OK).json(result)
}

const statisticalClient = async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
    const { fromDate, toDate } = req.query
    const criteria: StatisticalCriteria = { fromDate, toDate }
    const result = await AdminService.statisticalClient(criteria)
    return res.status(HttpStatus.OK).json(result)
}

const revenueByYear = async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
    const { year } = req.query
    const criteria: StatisticalCriteria = { year }
    const result = await AdminService.revenueByYear(criteria)
    return res.status(HttpStatus.OK).json(result)
}

const totalBookingByYear = async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
    const { year } = req.query
    const criteria: StatisticalCriteria = { year }
    const result = await AdminService.totalBookingByYear(criteria)
    return res.status(HttpStatus.OK).json(result)
}

const statisticalRevenueSeat = async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
    const { fromDate, toDate } = req.query
    const criteria: StatisticalCriteria = { fromDate, toDate }
    const result = await AdminService.statisticalRevenueSeat(criteria)
    return res.status(HttpStatus.OK).json(result)
}

export const AdminController = {
    reportClient,
    bookingsLimitTen,
    revenueInTwoYear,
    statisticalClient,
    revenueByYear,
    totalBookingByYear,
    statisticalRevenueSeat
}
