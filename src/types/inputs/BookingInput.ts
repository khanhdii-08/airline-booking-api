import { JourneyType } from '~/utils/enums'
import { PassengerInput } from './PassengerInput'

export class BookingInput {
    userId: string

    bookingCode: string

    flightAwayId: string

    flightReturnId: string

    amountTotal: number

    seatTotal: number

    journeyType: JourneyType

    passengers: PassengerInput[]
}