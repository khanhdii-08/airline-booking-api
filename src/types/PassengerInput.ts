import { PassengerType } from '~/utils/enums/passengerType'
import { SeatInput } from './SeatInput'
import { ServiceOptionInput } from './ServiceOptionInput'

export class PassengerInput {
    passengerCode: string

    color: string

    imageUrl: string

    firstName: string

    lastName: string

    country: string

    phoneNumber: string

    dateOfBirth: string

    email: string

    address: string

    passengerType: PassengerType

    seats: SeatInput[]

    serviceOpts: ServiceOptionInput[]
}
