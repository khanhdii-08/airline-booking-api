import { EmployeeCriteria } from './../types/criterias/EmployeeCriteria'
import { Pagination } from '~/types/Pagination'
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
import { BadRequestException } from '~/exceptions/BadRequestException'

const create = async (employeeInput: EmployeeInput) => {
    const { phoneNumber, password } = employeeInput

    const employee = await Employee.findOneBy({ phoneNumber })
    if (employee && employee.status === Status.ACT) {
        throw new AppError({ status: HttpStatus.CONFLICT, error: { message: 'sdt đã được đăng ký' } })
    } else if (employee && employee.status !== Status.ACT) {
        throw new ValidationException('sdt đăng ký hiện tại đã bị khóa hoặc xóa. liên hệ quản trị viên để được mở lại')
    }

    const hashedPassword = await argon2.hash(password)

    let employeeCode: string = ''
    do {
        employeeCode = generateCode('E')
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

    const { createdAt, updatedAt, status, ...info } = employeeInfo

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
    const employees = await Employee.createQueryBuilder('employee')
        .innerJoin('employee.user', 'user')
        .select('employee')
        .addSelect('user.userType')
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

const employee = async (id: string) => {
    const employee = await Employee.findOne({
        select: { user: { userType: true } },
        where: { id },
        relations: { user: true }
    })
    if (!employee) {
        throw new NotFoundException({ message: 'ko tìm thấy' })
    }

    return employee
}

const updateEmployee = async (id: string, employeeInput: EmployeeInput) => {
    const { name, dateOfBirth, gender, idCard, email, country, address, status, userType } = employeeInput
    const employee = await Employee.findOne({
        where: { id },
        relations: { user: true }
    })
    if (!employee) {
        throw new NotFoundException({ message: 'ko tìm thấy' })
    }

    const { user, ...employeeNotUser } = employee
    userType && (user.userType = userType)
    name && (employee.name = name)
    dateOfBirth && (employee.dateOfBirth = dateOfBirth)
    gender && (employee.gender = gender)
    idCard && (employee.idCard = idCard)
    email && (employee.email = email)
    country && (employee.country = country)
    address && (employee.address = address)
    status && (employee.status = status)

    user.save()
    employee.save()

    return employeeNotUser
}

const pending = async (id: string) => {
    const employee = await Employee.findOne({
        where: { id },
        relations: { user: true }
    })
    if (!employee) {
        throw new NotFoundException({ message: 'ko tìm thấy' })
    }
    if (employee.status !== Status.ACT) {
        throw new BadRequestException({ error: { message: 'không nằm ở trạng thái hoạt động' } })
    }
    const { user, ...employeeNotUser } = employee

    employee.status = Status.PEN
    user.isActived = false

    employee.save()
    user.save()

    return employeeNotUser
}

const open = async (id: string) => {
    const employee = await Employee.findOne({
        where: { id },
        relations: { user: true }
    })
    if (!employee) {
        throw new NotFoundException({ message: 'ko tìm thấy' })
    }
    if (employee.status !== Status.PEN) {
        throw new BadRequestException({ error: { message: 'không nằm ở trạng thái tạm ngưng' } })
    }
    const { user, ...employeeNotUser } = employee

    employee.status = Status.ACT
    user.isActived = true

    employee.save()
    user.save()

    return employeeNotUser
}

const deleteEmployee = async (id: string) => {
    const employee = await Employee.findOne({
        where: { id },
        relations: { user: true }
    })
    if (!employee) {
        throw new NotFoundException({ message: 'ko tìm thấy' })
    }
    if (employee.status !== Status.PEN) {
        throw new BadRequestException({ error: { message: 'không nằm ở trạng thái tạm ngưng' } })
    }
    const { user, ...employeeNotUser } = employee

    employee.status = Status.DEL
    user.isActived = false

    employee.save()
    user.save()

    return employeeNotUser
}

export const EmployeeService = {
    create,
    employeeInfo,
    employees,
    employee,
    updateEmployee,
    pending,
    open,
    deleteEmployee
}
