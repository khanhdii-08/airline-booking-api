import { EmployeeCriteria } from './../types/criterias/EmployeeCriteria'
import { Pagination } from '~/types/Pagination'
import { JwtPayload } from './../types/JwtPayload'
import { Status } from './../utils/enums/status.enum'
import { EmployeeInput } from '~/types/inputs/EmployeeInput'
import { User, Employee } from '~/entities'
import argon2 from 'argon2'
import { AppDataSource } from '~/config/database.config'
import {
    createPageable,
    genUUID,
    generateCode,
    getValueByKey,
    removeAccents,
    validateVariable
} from '~/utils/common.utils'
import { CountryEn, CountryVi, UserType } from '~/utils/enums'
import { AppError } from '~/exceptions/AppError'
import { HttpStatus } from '~/utils/httpStatus'
import { ValidationException } from '~/exceptions/ValidationException'
import { NotFoundException } from '~/exceptions/NotFoundException'

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

const employeeInfo = async (userId: string, language: string) => {
    const employeeInfo = await Employee.findOneBy({ user: { id: userId }, status: Status.ACT })
    if (!employeeInfo) {
        throw new NotFoundException({ message: 'ko tìm thấy' })
    }

    const { id, createdAt, updatedAt, status, ...info } = employeeInfo

    let country
    if (language === 'vi') {
        country = getValueByKey(info.country, CountryVi)
    } else if (language === 'en') {
        country = getValueByKey(info.country, CountryEn)
    }
    return {
        ...info,
        country
    }
}

const employees = async (role: UserType, criteria: EmployeeCriteria, pagination: Pagination) => {
    const { searchText, status, fromDate, toDate } = criteria
    console.log(searchText)
    const employees = await Employee.createQueryBuilder('employee')
        .innerJoin('employee.user', 'user')
        .where(
            '(coalesce(:searchText) is null or (unaccent(employee.employeeCode) ILIKE :searchText or unaccent(employee.name) ILIKE :searchText or unaccent(employee.phoneNumber) ILIKE :searchText))',
            {
                searchText: `%${removeAccents(searchText)}%`
            }
        )
        .andWhere('(coalesce(:status) is null or employee.status = :status)', {
            status: validateVariable(status)
        })
        .andWhere('(coalesce(:fromDate) IS NULL OR (DATE(employee.createdAt) >= DATE(:fromDate)))', {
            fromDate: validateVariable(fromDate)
        })
        .andWhere('(coalesce(:toDate) IS NULL OR (DATE(employee.createdAt) <= DATE(:toDate)))', {
            toDate: validateVariable(toDate)
        })
        .andWhere(
            '((:role = :manager and user.userType = :employee ) or (:role = :admin and user.userType != :admin))',
            {
                role: role,
                manager: UserType.MANAGER,
                employee: UserType.EMPLOYEE,
                admin: UserType.ADMIN
            }
        )
        .getMany()

    return createPageable(employees, pagination)
}

export const EmployeeService = { create, employeeInfo, employees }
