import { FlightCriteria } from '~/types/FlightCriteria'
import { Flight } from '~/entities/flight.entity'

const search = async (criteria: FlightCriteria) => {
    const queryFlightResult = await Flight.createQueryBuilder('flight')
        .innerJoinAndSelect('flight.airline', 'airline')
        .innerJoinAndSelect('flight.aircraft', 'aircraft')
        .innerJoinAndSelect('flight.sourceAirport', 'sourceAirport')
        .innerJoinAndSelect('sourceAirport.city', 'sourceCity')
        .innerJoinAndSelect('flight.destinationAirport', 'destinationAirport')
        .innerJoinAndSelect('destinationAirport.city', 'destinationCity')
        .innerJoinAndSelect('flight.flightSeatPrices', 'flightSeatPrice')
        .innerJoinAndSelect('flightSeatPrice.taxService', 'taxService')
        .innerJoin('flight.bookings', 'booking')
        .innerJoin('aircraft.aircraftSeats', 'aircraftSeat')
        .innerJoin('aircraftSeat.seat', 'seat')
        .where('sourceAirport.id = :sourceAirportId', {
            sourceAirportId: criteria.sourceAirportId
        })
        .andWhere('destinationAirport.id = :destinationAirportId', {
            destinationAirportId: criteria.destinationAirportId
        })
        .andWhere('DATE(flight.departureTime) = DATE(:departureDate)', {
            departureDate: criteria.departureDate
        })
        .andWhere('seat.id = :seatId', { seatId: criteria.seatId })
        .andWhere('flightSeatPrice.seat.id = :seatId', { seatId: criteria.seatId })
        .andWhere((qb) => {
            const subQuery = qb
                .subQuery()
                .select('COALESCE(SUM("booking"."total_amount"), 0)', 'sum')
                .from('Booking', 'booking')
                .innerJoin('booking.bookingSeats', 'bookingSeat')
                .where('booking.flight.id = flight.id')
                .andWhere('bookingSeat.seat.id = :seatId', { seatId: criteria.seatId })
                .getQuery()
            return `(${subQuery} + :numAdults + :numInfants) <= aircraftSeat.seatNumber`
        })
        .setParameters({
            numAdults: criteria.numAdults,
            numInfants: criteria.numInfants
        })
        .getMany()

    const result = queryFlightResult.map((value) => {
        const { flightSeatPrices, ...flightWithoutSeatPrices } = value

        return {
            ...flightWithoutSeatPrices,
            flightSeatPrice: flightSeatPrices[0]
        }
    })

    return result
}

export const FlightService = { search }