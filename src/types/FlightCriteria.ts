export interface FlightCriteria {
    sourceAirportId: string
    destinationAirportId: string
    departureDate: Date
    seatClass: string
    numAdults: number
    numChildren: number
    numInfants: number
}
