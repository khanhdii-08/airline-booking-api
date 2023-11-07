import { Status } from './../utils/enums/status.enum'
import { EmployeeInput } from '~/types/inputs/EmployeeInput'
import { User, Employee } from '~/entities'
import argon2 from 'argon2'
import { AppDataSource } from '~/config/database.config'
import { genUUID, generateCode } from '~/utils/common.utils'
import { UserType } from '~/utils/enums'
import { AppError } from '~/exceptions/AppError'
import { HttpStatus } from '~/utils/httpStatus'
import { ValidationException } from '~/exceptions/ValidationException'

const create = async (employeeInput: EmployeeInput) => {
    const { phoneNumber, password, userType } = employeeInput

    const employee = await Employee.findOneBy({ phoneNumber })
    if (employee && employee.status === Status.ACT) {
        throw new AppError({ status: HttpStatus.CONFLICT, error: { message: 'sdt đã được đăng ký' } })
    } else if (employee && employee.status !== Status.ACT) {
        throw new ValidationException('sdt đăng ký hiện tại đã bị khóa hoặc xóa. liên hệ quản trị viên để được mở lại')
    }

    const hashedPassword = await argon2.hash(password)

    let employeeCode: string = ''
    do {
        employeeCode = userType === UserType.EMPLOYEE ? generateCode('E') : generateCode('M')
        const employee = await Employee.findOneBy({ employeeCode })

        if (employee) {
            employeeCode = ''
        }
    } while (!employeeCode)

    const newUser = User.create({
        id: genUUID(),
        ...employeeInput,
        password: hashedPassword,
        isActived: true
    })
    const newEmployee = Employee.create({
        user: newUser,
        employeeCode,
        ...employeeInput,
        status: Status.ACT
    })

    await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.save(newUser)
        await transactionalEntityManager.save(newEmployee)
    })

    return newEmployee
}

export const EmployeeService = { create }
