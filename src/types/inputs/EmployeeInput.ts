import { Gender, UserType } from '~/utils/enums'

export class EmployeeInput {
    name: string

    dateOfBirth: Date

    gender: Gender

    idCard: string

    phoneNumber: string

    email: string

    userType: UserType

    country: string

    address: string

    password: string
}
