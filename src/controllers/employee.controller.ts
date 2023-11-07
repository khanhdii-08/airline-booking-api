import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { EmployeeService } from '~/services/employee.service'
import { EmployeeInput } from '~/types/inputs/EmployeeInput'
import { HttpStatus } from '~/utils/httpStatus'

const create = async (req: Request<ParamsDictionary, any, EmployeeInput>, res: Response) => {
    const employeeInput: EmployeeInput = req.body
    const result = await EmployeeService.create(employeeInput)
    return res.status(HttpStatus.CREATED).json(result)
}

export const EmployeeController = { create }
