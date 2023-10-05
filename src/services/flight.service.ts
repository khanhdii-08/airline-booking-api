import { FlightCriteria } from '~/types/FlightCriteria'
import { Flight } from '~/entities/flight.entity'

const search = async (criteria: FlightCriteria) => {
    const queryResult = await Flight.createQueryBuilder('flight')
        .leftJoinAndSelect('flight.airline', 'airline')
        .leftJoinAndSelect('flight.aircraft', 'aircraft')
        .leftJoinAndSelect('flight.sourceAirport', 'sourceAirport')
        .leftJoinAndSelect('flight.destinationAirport', 'destinationAirport')
        .leftJoinAndSelect('flight.flightSeatPrices', 'flightSeatPrices')
        .leftJoin('aircraft.aircraftSeats', 'as2') // Join AircraftSeat
        .leftJoin('as2.seat', 's') // Join Seat
        .where('sourceAirport.id = :sourceAirportId', {
            sourceAirportId: criteria.sourceAirportId
        })
        .andWhere('destinationAirport.id = :destinationAirportId', {
            destinationAirportId: criteria.destinationAirportId
        })
        .andWhere('DATE(flight.departureTime) = DATE(:departureDate)', {
            departureDate: criteria.departureDate
        })
        .andWhere('s.seatClass = :seatClass', {
            seatClass: criteria.seatClass
        })
        .getMany()

    return queryResult
}

export const FlightService = { search }
