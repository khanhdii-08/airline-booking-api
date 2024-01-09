import { EmployeeCriteria } from './../types/criterias/EmployeeCriteria'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { EmployeeService } from '~/services/employee.service'
import { Pagination } from '~/types/Pagination'
import { EmployeeInput } from '~/types/inputs/EmployeeInput'
import { HttpStatus } from '~/utils/httpStatus'

const create = async (req: Request<ParamsDictionary, any, EmployeeInput>, res: Response) => {
    const employeeInput: EmployeeInput = req.body
    const result = await EmployeeService.create(employeeInput)
    return res.status(HttpStatus.CREATED).json(result)
}

const employeeInfo = async (req: Request, res: Response) => {
    const language: string = req.headers['accept-language'] || 'en'
    const result = await EmployeeService.employeeInfo(req.jwtPayload._id, language)
    return res.status(HttpStatus.OK).json(result)
}

const employees = async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
    const { page, size, sort, searchText, status, fromDate, toDate } = req.query
    const criteria: EmployeeCriteria = { searchText, status, fromDate, toDate }
    const pagination: Pagination = { page, size, sort }
    const result = await EmployeeService.employees(req.jwtPayload.role, criteria, pagination)

    return res.status(HttpStatus.OK).json(result)
}

const employee = async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
    const id = req.params['id']
    const result = await EmployeeService.employee(id)

    return res.status(HttpStatus.OK).json(result)
}

const updateEmployee = async (req: Request<ParamsDictionary, any, EmployeeInput>, res: Response) => {
    const id = req.params['id']
    const employeeInput: EmployeeInput = req.body
    const result = await EmployeeService.updateEmployee(id, employeeInput)
    return res.status(HttpStatus.OK).json(result)
}

const pending = async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
    const id = req.params['id']
    const result = await EmployeeService.pending(id)

    return res.status(HttpStatus.OK).json(result)
}

const open = async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
    const id = req.params['id']
    const result = await EmployeeService.open(id)

    return res.status(HttpStatus.OK).json(result)
}

const deleteEmployee = async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
    const id = req.params['id']
    const result = await EmployeeService.deleteEmployee(id)

    return res.status(HttpStatus.OK).json(result)
}

export const EmployeeController = {
    create,
    employeeInfo,
    employees,
    employee,
    updateEmployee,
    pending,
    open,
    deleteEmployee
}
