import { FlightCriteria } from '~/types/criterias/FlightCriteria'
import { Flight } from '~/entities/flight.entity'
import { Status } from '~/utils/enums'

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
                .select('COALESCE(count(bookingSeat.id), 0)', 'sum')
                .from('Booking', 'booking')
                .innerJoin('booking.bookingSeats', 'bookingSeat')
                .where('booking.flightAway.id = flight.id or booking.flightReturn.id = flight.id')
                .andWhere('bookingSeat.seat.id = :seatId', { seatId: criteria.seatId })
                .andWhere('bookingSeat.flight.id = flight.id')
                .andWhere('bookingSeat.status = :status', { status: Status.ACT })
                .getQuery()
            return `(${subQuery} + :numAdults + :numChildren) <= aircraftSeat.seatNumber`
        })
        .setParameters({
            numAdults: criteria.numAdults,
            numChildren: criteria.numChildren
        })
        .getMany()

    const result = queryFlightResult.map((value) => {
        const { flightSeatPrices, ...flightWithoutSeatPrices } = value

        const { id, createdAt, updatedAt, taxPrice, ...flightSeatPriceWithoutTaxPrice } = flightSeatPrices[0]

        return {
            flightSeatPrice: {
                ...flightSeatPriceWithoutTaxPrice,
                infantTaxPrice: 0,
                adultTaxPrice: (flightSeatPrices[0].adultPrice * 10) / 100,
                childrenTaxPrice: (flightSeatPrices[0].childrenPrice * 10) / 100
            },
            ...flightWithoutSeatPrices
        }
    })

    return result
}

const create = () => {}

export const FlightService = { search, create }
