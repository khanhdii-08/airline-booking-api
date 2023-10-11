import { BookingSeat, BookingServiceOpt, Passenger, PaymentTransaction } from '~/entities'
import { JourneyType } from '~/utils/enums'

export class BookingInput {
    userId: string

    flightId: string

    returnFlightId: string

    totalAmount: number

    journeyType: JourneyType

    passengers: Passenger[]

    bookingSeats: BookingSeat[]

    bookingServiceOpts: BookingServiceOpt[]

    paymentTransaction: PaymentTransaction
}
