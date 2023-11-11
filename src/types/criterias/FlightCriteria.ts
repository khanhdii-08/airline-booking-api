export interface FlightCriteria {
    searchText?: string

    sourceAirportId?: string

    destinationAirportId?: string

    departureDate?: Date

    arrivalDate?: Date

    seatId?: string

    numAdults?: number

    numChildren?: number

    numInfants?: number
}
