import { JourneyType } from '~/utils/enums'
import { PassengerInput } from './PassengerInput'
import { PaymentInput } from './PaymentInput'

export class BookingInput {
    bookingId: string

    note: string

    userId: string

    bookingCode: string

    flightId: string

    flightAwayId: string

    flightReturnId: string

    seatId: string

    amountTotal: number

    seatTotal: number

    journeyType: JourneyType

    passengers: PassengerInput[]

    payment: PaymentInput
}
