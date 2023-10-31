import { PassengerType } from '~/utils/enums/passengerType'
import { SeatInput } from './SeatInput'
import { ServiceOptionInput } from './ServiceOptionInput'
import { Gender } from '~/utils/enums'

export class PassengerInput {
    passengerId: string

    passengerCode: string

    color: string

    imageUrl: string

    gender: Gender

    firstName: string

    lastName: string

    country: string

    idCard: string

    phoneNumber: string

    dateOfBirth: string

    email: string

    address: string

    passengerType: PassengerType

    seats: SeatInput[]

    serviceOpts: ServiceOptionInput[]
}
