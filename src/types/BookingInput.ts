import { BookingSeat, BookingServiceOpt, Passenger, PaymentTransaction } from '~/entities'
import { JourneyType } from '~/utils/enums'
import { PassengerInput } from './PassengerInput'

export class BookingInput {
    userId: string

    flightId: string

    returnFlightId: string

    totalAmount: number

    journeyType: JourneyType

    passengers: PassengerInput[]

    paymentTransaction: PaymentTransaction
}
