export interface FlightCriteria {
    sourceAirportId: string
    destinationAirportId: string
    departureDate: Date
    seatId: string
    numAdults: number
    numChildren: number
    numInfants: number
}
