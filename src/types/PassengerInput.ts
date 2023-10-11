import { PassengerType } from '~/utils/enums/passengerType'
import { SeatInput } from './SeatInput'

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

    seat: SeatInput

    serviceOptIds: string[]
}
