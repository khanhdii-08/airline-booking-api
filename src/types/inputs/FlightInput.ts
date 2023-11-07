import { FlightSeatPriceInput } from './FlightSeatPriceInput'
import { FlightType } from '~/utils/enums'

export class FlightInput {
    sourceAirportId: string

    destinationAirportId: string

    aircraftId: string

    departureTime: Date

    arrivalTime: Date

    flightType: FlightType

    flightSeatPrices: FlightSeatPriceInput[]
}
