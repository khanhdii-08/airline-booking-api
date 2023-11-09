export interface FlightCriteria {
    sourceAirportId?: string

    destinationAirportId?: string

    departureDate?: Date

    arrivalDate?: Date

    seatId?: string

    numAdults?: number

    numChildren?: number

    numInfants?: number
}
