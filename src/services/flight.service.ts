import { TaxService } from './../entities/tax-service.entity'
import { Airline } from './../entities/airline.entity'
import { FlightInput } from './../types/inputs/FlightInput'
import { FlightCriteria } from '~/types/criterias/FlightCriteria'
import { Flight } from '~/entities/flight.entity'
import { FlightType, Status } from '~/utils/enums'
import { Aircraft, Airport, FlightSeatPrice, Seat } from '~/entities'
import { genUUID, generateFlightNumber } from '~/utils/common.utils'
import { NotFoundException } from '~/exceptions/NotFoundException'
import { AppDataSource } from '~/config/database.config'

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

        const { id, createdAt, updatedAt, ...flightSeatPriceWithoutTaxPrice } = flightSeatPrices[0]

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

const create = async (flightInput: FlightInput) => {
    const {
        aircraftId,
        departureTime,
        arrivalTime,
        sourceAirportId,
        destinationAirportId,
        flightType,
        flightSeatPrices
    } = flightInput

    const airline = await Airline.find()
    if (!airline) {
        throw new NotFoundException({ message: 'dsds' })
    }

    const taxService = await TaxService.findOneBy({ flightType })
    if (!taxService) {
        throw new NotFoundException({ message: 'dsds' })
    }

    const newFlight = Flight.create({
        id: genUUID(),
        flightCode: generateFlightNumber(),
        aircraft: Aircraft.create({ id: aircraftId }),
        airline: airline[0],
        sourceAirport: Airport.create({ id: sourceAirportId }),
        destinationAirport: Airport.create({ id: destinationAirportId }),
        departureTime: new Date(departureTime),
        arrivalTime: new Date(arrivalTime),
        status: Status.ACT
    })

    const flightSeatPricesToSave: FlightSeatPrice[] = []
    flightSeatPrices.forEach(async (fsp) => {
        const seat = await Seat.findOneBy({ id: fsp.seatId })
        if (!seat) {
            throw new NotFoundException({ message: 'dsds' })
        }
        const newFlightSeatPrice = FlightSeatPrice.create({
            flight: newFlight,
            adultPrice: fsp.seatPrice,
            childrenPrice: (fsp.seatPrice * 90) / 100,
            infantPrice: flightType === FlightType.DOMESTIC ? 100000 : 300000,
            seat,
            seatClass: seat.seatClass,
            taxService
        })

        flightSeatPricesToSave.push(newFlightSeatPrice)
    })

    await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.save(newFlight)
        await transactionalEntityManager.save(flightSeatPricesToSave)
    })

    return newFlight
}

export const FlightService = { search, create }
