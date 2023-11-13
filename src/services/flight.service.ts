import { FlightInput } from '~/types/inputs/FlightInput'
import { Pagination } from '~/types/Pagination'
import { TaxService } from './../entities/tax-service.entity'
import { Airline } from './../entities/airline.entity'
import { FlightCriteria } from '~/types/criterias/FlightCriteria'
import { Flight } from '~/entities/flight.entity'
import { FlightType, Status } from '~/utils/enums'
import { Aircraft, Airport, Booking, FlightSeatPrice, Seat } from '~/entities'
import { createPageable, genUUID, generateFlightNumber, validateVariable } from '~/utils/common.utils'
import { NotFoundException } from '~/exceptions/NotFoundException'
import { AppDataSource } from '~/config/database.config'
import { BadRequestException } from '~/exceptions/BadRequestException'

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
        flightType,
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

const flights = async (status: string, criteria: FlightCriteria, pagination: Pagination) => {
    const { searchText, sourceAirportId, destinationAirportId, departureDate, arrivalDate } = criteria

    const flights = await Flight.createQueryBuilder('flight')
        .innerJoinAndSelect('flight.sourceAirport', 'sourceAirport')
        .innerJoinAndSelect('sourceAirport.city', 'sourceCity')
        .innerJoinAndSelect('flight.destinationAirport', 'destinationAirport')
        .innerJoinAndSelect('destinationAirport.city', 'destinationCity')
        .where('(coalesce(:status) IS NULL OR flight.status = :status)', {
            status: status === 'all' ? null : status.toUpperCase()
        })
        .andWhere('(coalesce(:searchText) is null or flight.flightCode ilike :searchText)', {
            searchText: validateVariable(searchText)
        })
        .andWhere('(coalesce(:sourceAirportId) is null or sourceAirport.id = :sourceAirportId)', {
            sourceAirportId: validateVariable(sourceAirportId)
        })
        .andWhere('(coalesce(:destinationAirportId) is null or destinationAirport.id = :destinationAirportId)', {
            destinationAirportId: validateVariable(destinationAirportId)
        })
        .andWhere('(coalesce(:departureDate) is null or DATE(flight.departureTime) = DATE(:departureDate))', {
            departureDate: validateVariable(departureDate)
        })
        .andWhere('(coalesce(:arrivalDate) is null or DATE(flight.arrivalTime) = DATE(:arrivalDate))', {
            arrivalDate: validateVariable(arrivalDate)
        })
        .getMany()

    return createPageable(flights, pagination)
}

const updateFlight = async (id: string, flightInput: FlightInput) => {
    const { aircraftId, departureTime, arrivalTime, flightSeatPrices } = flightInput

    const flight = await Flight.findOne({ where: { id, status: Status.ACT }, relations: { aircraft: true } })
    if (!flight) {
        throw new NotFoundException({ message: 'không tìm thấy' })
    }

    aircraftId && (flight.aircraft.id = aircraftId)
    departureTime && (flight.departureTime = departureTime)
    arrivalTime && (flight.arrivalTime = arrivalTime)

    const flightSeatPricesInDb = await FlightSeatPrice.find({
        where: { flight: { id: flight.id } },
        relations: { seat: true }
    })
    if (!flightSeatPricesInDb) {
        throw new NotFoundException({ message: 'không tìm thấy' })
    }

    flightSeatPrices.forEach((fsp) => {
        const flightSeatPrice = flightSeatPricesInDb.find((element) => fsp.seatId === element.seat.id)
        if (flightSeatPrice) {
            flightSeatPrice.adultPrice = fsp.seatPrice
            flightSeatPrice.childrenPrice = (fsp.seatPrice * 90) / 100
            flightSeatPrice.save()
        }
    })

    flight.save()

    return flight
}

const flight = async (id: string) => {
    const flight = await Flight.findOne({
        where: { id },
        relations: { sourceAirport: true, destinationAirport: true, aircraft: true, flightSeatPrices: true }
    })
    if (!flight) {
        throw new NotFoundException({ message: 'không tìm thấy' })
    }

    return flight
}

const updateStatus = async (id: string, status: Status) => {
    const flight = await Flight.findOne({
        where: { id }
    })
    if (!flight) {
        throw new NotFoundException({ message: 'không tìm thấy' })
    }

    if (status === Status.PEN) {
        if (flight.status !== Status.ACT) {
            throw new BadRequestException({ error: { message: 'không ở trạng thái hoạt động' } })
        }
        flight.status = Status.PEN
        const bookings = await Booking.find({
            where: [{ flightAway: { id: flight.id } }, { flightReturn: { id: flight.id } }],
            relations: { bookingSeats: true, bookingServiceOpts: true }
        })

        bookings &&
            bookings.forEach((booking) => {
                booking.status = Status.DEL
                const { bookingSeats, bookingServiceOpts } = booking
                bookingSeats &&
                    bookingSeats.forEach((bookingSeat) => {
                        bookingSeat.status = Status.DEL
                        bookingSeat.save()
                    })
                bookingServiceOpts &&
                    bookingServiceOpts.forEach((bookingServiceOpt) => {
                        bookingServiceOpt.status = Status.DEL
                        bookingServiceOpt.save()
                    })
            })
        await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
            await transactionalEntityManager.save(flight)
            await transactionalEntityManager.save(bookings)
        })
        return flight
    } else if (status === Status.ACT) {
        if (flight.status !== Status.PEN) {
            throw new BadRequestException({ error: { message: 'không ở trạng thái tạm ngưng' } })
        }
        flight.status = Status.ACT
        await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
            await transactionalEntityManager.save(flight)
        })
        return flight
    }
}

export const FlightService = { search, create, flights, updateFlight, flight, updateStatus }
