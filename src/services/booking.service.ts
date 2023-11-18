import { BookingCriteria } from '~/types/criterias/BookingCriteria'
import {
    Booking,
    BookingSeat,
    BookingServiceOpt,
    Flight,
    FlightSeatPrice,
    Passenger,
    PaymentTransaction,
    Seat,
    ServiceOption,
    User
} from '~/entities'
import { BookingInput } from '~/types/inputs/BookingInput'
import { PaymentStatus, Status } from '~/utils/enums'
import { NotFoundException } from '~/exceptions/NotFoundException'
import { AppDataSource } from '~/config/database.config'
import { createPageable, genUUID, generateBookingCode, removeAccents, validateVariable } from '~/utils/common.utils'
import { AppError } from '~/exceptions/AppError'
import { HttpStatus } from '~/utils/httpStatus'
import { PassengerType } from '~/utils/enums/passengerType'
import { In } from 'typeorm'
import { BadRequestException } from '~/exceptions/BadRequestException'
import { redisClient } from '~/config/redis.config'
import { UnauthorizedException } from '~/exceptions/UnauthorizedException'
import { MESSAGE_CANCEL_BOOKING, OTP_TIME_BOOKING_CANCEL_KEY, OTP_TIME_BOOKING_UPDATE_KEY } from '~/utils/constants'
import { MailProvider } from '~/providers/mail.provider'
import { Pagination } from '~/types/Pagination'
import { ErrorResponse } from '~/types/ErrorResponse'
import { PassengerInput } from '~/types/inputs/PassengerInput'

const booking = async (bookingInput: BookingInput) => {
    const { userId, flightAwayId, flightReturnId, seatId, passengers, ...booking } = bookingInput
    const flights: Flight[] = []

    let bookingCode = bookingInput.bookingCode

    const flightAway = await Flight.findOne({
        where: { id: flightAwayId },
        relations: { aircraft: true, sourceAirport: { city: true }, destinationAirport: { city: true } }
    })
    if (!flightAway) {
        throw new NotFoundException({ message: 'null' })
    }
    flights.push(flightAway)
    let flightReturn = null
    if (flightReturnId) {
        flightReturn = await Flight.findOne({
            where: { id: flightReturnId },
            relations: { aircraft: true, sourceAirport: { city: true }, destinationAirport: { city: true } }
        })
        if (!flightReturn) {
            throw new NotFoundException({ message: 'null' })
        }
        flights.push(flightReturn)
    }

    let user = null
    if (userId) {
        user = await User.findOneBy({ id: userId })
    }

    let paymentStatus = PaymentStatus.SUCCESSFUL
    if (bookingCode) {
        paymentStatus = PaymentStatus.SUCCESSFUL
        const paymentTransaction = await PaymentTransaction.findOneBy({ bookingCode })
        if (!paymentTransaction) {
            throw new NotFoundException({ message: 'null' })
        }
    }

    if (bookingCode) {
        const booking = await Booking.findOneBy({ bookingCode })
        if (booking) {
            throw new AppError({ status: HttpStatus.CONFLICT, error: { message: 'tồn tại' } })
        }
    } else {
        do {
            bookingCode = generateBookingCode()
            const booking = await Booking.findOneBy({ bookingCode })
            if (booking) {
                bookingCode = ''
            }
        } while (!bookingCode)
        paymentStatus = PaymentStatus.PENDING
    }

    const newBooking = await Booking.create({
        id: genUUID(),
        seat: Seat.create({ id: seatId }),
        ...booking,
        bookingCode,
        flightAway,
        bookingDate: new Date(),
        paymentStatus,
        status: Status.ACT
    })

    if (flightReturn) newBooking.flightReturn = flightReturn

    if (user) newBooking.user = user

    const passengersToSave: Passenger[] = []
    const bookingSeatsToSave: BookingSeat[] = []
    const bookingServiceOptsToSave: BookingServiceOpt[] = []

    passengers.forEach(async (passenger) => {
        const newPassenger = Passenger.create({
            id: genUUID(),
            ...passenger,
            isPasserby: true,
            booking: newBooking
        })

        passengersToSave.push(newPassenger)

        passenger.seats &&
            passenger.seats.forEach(async (seat) => {
                const newBookingSeat = BookingSeat.create({
                    passenger: newPassenger,
                    booking: newBooking,
                    seat: Seat.create({ id: seat.seatId }),
                    flight: Flight.create({ id: seat.flightId }),
                    status: Status.ACT,
                    ...seat
                })
                bookingSeatsToSave.push(newBookingSeat)
            })
        passenger.serviceOpts &&
            passenger.serviceOpts &&
            passenger.serviceOpts.forEach(async (serviceOpt) => {
                const newBookingServiceOpt = BookingServiceOpt.create({
                    passenger: newPassenger,
                    booking: newBooking,
                    serviceOption: ServiceOption.create({ id: serviceOpt.serviceOptId }),
                    flight: Flight.create({ id: serviceOpt.flightId }),
                    status: Status.ACT,
                    ...serviceOpt
                })
                bookingServiceOptsToSave.push(newBookingServiceOpt)
            })
    })

    await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.save(newBooking)
        await transactionalEntityManager.save(passengersToSave)
        await transactionalEntityManager.save(bookingSeatsToSave)
        await transactionalEntityManager.save(bookingServiceOptsToSave)
    })

    await MailProvider.sendMailBooking({ bookingCode, flights, passengers })

    return bookingInput
}

const bookingDetail = async (criteria: BookingCriteria) => {
    const { bookingId, bookingCode, firstName, lastName } = criteria

    const booking = await AppDataSource.getRepository(Booking)
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.flightAway', 'flightAway')
        .leftJoinAndSelect('booking.flightReturn', 'flightReturn')
        .innerJoinAndSelect('flightAway.sourceAirport', 'sourceAirportAway')
        .innerJoinAndSelect('flightAway.destinationAirport', 'destinationAirportAway')
        .leftJoinAndSelect('flightReturn.sourceAirport', 'sourceAirportReturn')
        .leftJoinAndSelect('flightReturn.destinationAirport', 'destinationAirportReturn')
        .innerJoin('booking.passengers', 'passengers')
        .innerJoinAndSelect('booking.seat', 'seat')
        .where('(booking.id = :bookingId)', { bookingId })
        .orWhere('booking.bookingCode = :bookingCode', {
            bookingCode: bookingCode?.trim()
        })
        .andWhere('unaccent(passengers.firstName) ILIKE :firstName', {
            firstName: `%${removeAccents(firstName?.trim())}%`
        })
        .andWhere('unaccent(passengers.lastName) ILIKE :lastName', {
            lastName: `%${removeAccents(lastName?.trim())}%`
        })
        .getOne()

    if (!booking) {
        throw new NotFoundException({ message: 'ko tìm thấy chuyến bay' })
    }

    const { flightAway, flightReturn, seat, ...bookingDetail } = booking

    const passengerAways = await Passenger.findBy({
        booking: {
            id: booking.id
        }
    })

    const flightSeatPriceAway = await FlightSeatPrice.findOne({
        where: { flight: { id: flightAway.id }, seat: { id: seat.id } },
        relations: { taxService: true, seat: true }
    })

    const passengerAwayIds = passengerAways.map((passengerAway) => passengerAway.id)

    const bookingSeatAways = await BookingSeat.find({
        where: {
            flight: {
                id: booking.flightAway.id
            },
            passenger: {
                id: In(passengerAwayIds)
            },
            booking: {
                id: booking.id
            },
            status: Status.ACT
        },
        relations: {
            passenger: true
        }
    })

    const bookingServiceOptAways = await BookingServiceOpt.find({
        where: {
            flight: {
                id: booking.flightAway.id
            },
            passenger: {
                id: In(passengerAwayIds)
            },
            booking: {
                id: booking.id
            },
            status: Status.ACT
        },
        relations: {
            passenger: true,
            serviceOption: true
        }
    })

    const passengerAwaysDetail = passengerAways.map((passengerAway) => {
        const bookingSeatAway = bookingSeatAways.find(
            (bookingSeatAway) => bookingSeatAway.passenger.id === passengerAway.id
        )
        const seatCode = bookingSeatAway?.seatCode

        let seat
        if (passengerAway.passengerType === PassengerType.ADULT && flightSeatPriceAway) {
            seat = {
                seatPrice: flightSeatPriceAway.adultPrice,
                taxPrice: (flightSeatPriceAway.adultPrice * 10) / 100,
                ...flightSeatPriceAway.seat,
                servicePrice: seatCode ? flightSeatPriceAway.seat.servicePrice : 0,
                seatCode
            }
        } else if (passengerAway.passengerType === PassengerType.CHILD && flightSeatPriceAway) {
            seat = {
                seatPrice: flightSeatPriceAway.childrenPrice,
                taxPrice: (flightSeatPriceAway.childrenPrice * 10) / 100,
                ...flightSeatPriceAway.seat,
                servicePrice: seatCode ? flightSeatPriceAway.seat.servicePrice : 0,
                seatCode
            }
        } else if (passengerAway.passengerType === PassengerType.INFANT && flightSeatPriceAway) {
            seat = {
                seatPrice: flightSeatPriceAway.infantPrice,
                taxPrice: 0,
                ...flightSeatPriceAway.seat,
                servicePrice: seatCode ? flightSeatPriceAway.seat.servicePrice : 0,
                seatCode
            }
        }
        const taxService = flightSeatPriceAway?.taxService

        const serviceOpts = bookingServiceOptAways
            .filter((bookingServiceOpt) => bookingServiceOpt.passenger.id === passengerAway.id)
            .map((bookingServiceOpt) => {
                const { passenger, ...bookingService } = bookingServiceOpt
                return {
                    bookingService
                }
            })

        return {
            ...passengerAway,
            seat,
            taxService,
            serviceOpts
        }
    })

    let passengerReturnsDetail

    if (flightReturn) {
        const passengerReturns = await Passenger.findBy({
            booking: {
                id: booking.id
            }
        })

        const flightSeatPriceReturn = await FlightSeatPrice.findOne({
            where: { flight: { id: flightReturn.id }, seat: { id: seat.id } },
            relations: { taxService: true, seat: true }
        })

        const passengerReturnIds = passengerReturns.map((passengerReturn) => passengerReturn.id)
        const bookingSeatReturns = await BookingSeat.find({
            where: {
                flight: {
                    id: flightReturn.id
                },
                passenger: {
                    id: In(passengerReturnIds)
                },
                booking: {
                    id: booking.id
                },
                status: Status.ACT
            },
            relations: {
                passenger: true
            }
        })

        const bookingServiceOptReturns = await BookingServiceOpt.find({
            where: {
                flight: {
                    id: flightReturn.id
                },
                passenger: {
                    id: In(passengerReturnIds)
                },
                booking: {
                    id: booking.id
                },
                status: Status.ACT
            },
            relations: {
                passenger: true,
                serviceOption: true
            }
        })
        passengerReturnsDetail = passengerReturns.map((passengerReturn) => {
            const bookingSeatReturn = bookingSeatReturns.find(
                (bookingSeatReturn) => bookingSeatReturn.passenger.id === passengerReturn.id
            )
            const seatCode = bookingSeatReturn?.seatCode

            let seat
            if (passengerReturn.passengerType === PassengerType.ADULT && flightSeatPriceReturn) {
                seat = {
                    seatPrice: flightSeatPriceReturn.adultPrice,
                    taxPrice: (flightSeatPriceReturn.adultPrice * 10) / 100,
                    ...flightSeatPriceReturn.seat,
                    servicePrice: seatCode ? flightSeatPriceReturn.seat.servicePrice : 0,
                    seatCode
                }
            } else if (passengerReturn.passengerType === PassengerType.CHILD && flightSeatPriceReturn) {
                seat = {
                    seatPrice: flightSeatPriceReturn.childrenPrice,
                    taxPrice: (flightSeatPriceReturn.childrenPrice * 10) / 100,
                    ...flightSeatPriceReturn.seat,
                    servicePrice: seatCode ? flightSeatPriceReturn.seat.servicePrice : 0,
                    seatCode
                }
            } else if (passengerReturn.passengerType === PassengerType.INFANT && flightSeatPriceReturn) {
                seat = {
                    seatPrice: flightSeatPriceReturn.infantPrice,
                    taxPrice: 0,
                    ...flightSeatPriceReturn.seat,
                    servicePrice: seatCode ? flightSeatPriceReturn.seat.servicePrice : 0,
                    seatCode
                }
            }
            const taxService = flightSeatPriceReturn?.taxService

            const serviceOpts = bookingServiceOptReturns
                .filter((bookingServiceOpt) => bookingServiceOpt.passenger.id === passengerReturn.id)
                .map((bookingServiceOpt) => {
                    const { passenger, ...bookingService } = bookingServiceOpt
                    return {
                        bookingService
                    }
                })

            return {
                ...passengerReturn,
                seat,
                taxService,
                serviceOpts
            }
        })
    }

    const flightAwayDetail = {
        ...flightAway,
        passengerAwaysDetail
    }

    const flightReturnDetail = {
        ...flightReturn,
        passengerReturnsDetail
    }

    return { bookingDetail, flightAwayDetail, flightReturnDetail }
}

const bookingCancel = async (bookingInput: BookingInput) => {
    const { bookingId, note } = bookingInput
    const booking = await Booking.findOneBy({ id: bookingId })

    if (!booking) {
        throw new NotFoundException({ message: 'không tìm thấy chuyến bay' })
    }
    if (booking && booking.status !== Status.ACT) {
        throw new BadRequestException({ error: { message: 'kho phải là active', data: booking } })
    }

    const savedOtp = await redisClient.get(`${OTP_TIME_BOOKING_CANCEL_KEY}:${booking.id}`)
    if (!savedOtp) {
        throw new UnauthorizedException('yêu cầu không thể thực hiện')
    }

    booking.note = note
    booking.status = Status.PEN

    await booking.save().then(async () => {
        await redisClient.del(`${OTP_TIME_BOOKING_CANCEL_KEY}:${booking.id}`)
    })

    return booking
}

const updateBooking = async (bookingInput: BookingInput) => {
    const { bookingId, flightId, flightAwayId, flightReturnId, amountTotal } = bookingInput
    const booking = await Booking.findOne({
        where: { id: bookingId },
        relations: { flightAway: true, flightReturn: true }
    })

    if (!booking) {
        throw new NotFoundException({ message: 'không tìm thấy chuyến bay' })
    }
    if (booking && booking.status !== Status.ACT) {
        throw new BadRequestException({ error: { message: 'kho phải là active', data: booking } })
    }
    const savedOtp = await redisClient.get(`${OTP_TIME_BOOKING_UPDATE_KEY}:${booking.id}`)
    if (!savedOtp) {
        throw new UnauthorizedException('yêu cầu không thể thực hiện')
    }

    const bookingSeats = await BookingSeat.find({
        where: { booking: { id: booking.id } },
        relations: { flight: true, booking: true }
    })

    const bookingServiceOpts = await BookingServiceOpt.find({
        where: { booking: { id: booking.id } },
        relations: { flight: true, booking: true }
    })

    if (flightAwayId && !flightReturnId) {
        booking.flightAway.id = flightId
        booking.amountTotal = amountTotal
        bookingSeats.forEach((bookingSeat) => {
            if (bookingSeat.flight.id === flightAwayId && booking.id === bookingSeat.booking.id) {
                bookingSeat.status = Status.DEL
            }
        })

        bookingServiceOpts.forEach((bookingServiceOpt) => {
            if (bookingServiceOpt.flight.id === flightAwayId && booking.id === bookingServiceOpt.booking.id) {
                bookingServiceOpt.flight.id = flightId
            }
        })
    } else if (booking.flightReturn && flightReturnId && !flightAwayId) {
        booking.flightReturn.id = flightId
        booking.amountTotal = amountTotal
        bookingSeats.forEach((bookingSeat) => {
            if (bookingSeat.flight.id === flightReturnId && booking.id === bookingSeat.booking.id) {
                bookingSeat.status = Status.DEL
            }
        })
        bookingServiceOpts.forEach((bookingServiceOpt) => {
            if (bookingServiceOpt.flight.id === flightReturnId && booking.id === bookingServiceOpt.booking.id) {
                bookingServiceOpt.flight.id = flightId
            }
        })
    }

    await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.save(booking)
        await transactionalEntityManager.save(bookingSeats)
        await transactionalEntityManager.save(bookingServiceOpts)
    })

    await redisClient.del(`${OTP_TIME_BOOKING_UPDATE_KEY}:${booking.id}`)

    return booking
}

const bookingAddService = async (bookingInput: BookingInput) => {
    const { bookingId, passengers, amountTotal, seatTotal } = bookingInput
    const booking = await Booking.findOne({
        where: { id: bookingId },
        relations: { flightAway: true, flightReturn: true }
    })
    if (!booking) {
        throw new NotFoundException({ message: 'không tìm thấy chuyến bay' })
    }
    if (booking && booking.status !== Status.ACT) {
        throw new BadRequestException({ error: { message: 'kho phải là active', data: booking } })
    }

    booking.amountTotal = amountTotal
    booking.seatTotal = seatTotal

    const bookingSeatsToSave: BookingSeat[] = []
    const bookingServiceOptsToSave: BookingServiceOpt[] = []

    const bookingSeats = await BookingSeat.find({
        where: { booking: { id: booking.id }, status: Status.ACT },
        relations: { passenger: true, seat: true, flight: true }
    })

    const bookingServiceOpts = await BookingServiceOpt.find({
        where: { booking: { id: booking.id }, status: Status.ACT },
        relations: { passenger: true, serviceOption: true, flight: true }
    })

    passengers.forEach((passenger) => {
        passenger.seats.forEach((seat) => {
            const bookingSeat = bookingSeats.find(
                (bookingSeat) =>
                    bookingSeat.passenger.id === passenger.passengerId &&
                    bookingSeat.seat.id === seat.seatId &&
                    bookingSeat.flight.id === seat.flightId
            )
            if (bookingSeat) {
                bookingSeatsToSave.push(
                    BookingSeat.create({
                        ...bookingSeat,
                        ...seat
                    })
                )
            } else {
                bookingSeatsToSave.push(
                    BookingSeat.create({
                        ...seat,
                        passenger: Passenger.create({ id: passenger.passengerId }),
                        booking,
                        seat: Seat.create({ id: seat.seatId }),
                        flight: Flight.create({ id: seat.flightId }),
                        status: Status.ACT
                    })
                )
            }
        })
        passenger.serviceOpts.forEach((serviceOpt) => {
            const bookingServiceOpt = bookingServiceOpts.find(
                (bookingServiceOpt) =>
                    bookingServiceOpt.passenger.id === passenger.passengerId &&
                    bookingServiceOpt.serviceOption.id === serviceOpt.serviceOptId &&
                    bookingServiceOpt.flight.id === serviceOpt.flightId
            )
            if (bookingServiceOpt) {
                bookingServiceOptsToSave.push(BookingServiceOpt.create({ ...bookingServiceOpt, ...serviceOpt }))
            } else {
                bookingServiceOptsToSave.push(
                    BookingServiceOpt.create({
                        passenger: Passenger.create({ id: passenger.passengerId }),
                        booking,
                        serviceOption: ServiceOption.create({ id: serviceOpt.serviceOptId }),
                        flight: Flight.create({ id: serviceOpt.flightId }),
                        status: Status.ACT,
                        ...serviceOpt
                    })
                )
            }
        })
    })

    await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.save(bookingSeatsToSave)
        await transactionalEntityManager.save(bookingServiceOptsToSave)
    })

    return booking
}

const myBooking = async (userId: string, status: string, criteria: BookingCriteria, pagination: Pagination) => {
    const { bookingCode, fromDate, toDate } = criteria

    const bookings = await AppDataSource.getRepository(Booking)
        .createQueryBuilder('booking')
        .innerJoin('booking.user', 'user')
        .leftJoinAndSelect('booking.flightAway', 'flightAway')
        .leftJoinAndSelect('booking.flightReturn', 'flightReturn')
        .innerJoinAndSelect('flightAway.sourceAirport', 'sourceAirportAway')
        .innerJoinAndSelect('flightAway.destinationAirport', 'destinationAirportAway')
        .leftJoinAndSelect('flightReturn.sourceAirport', 'sourceAirportReturn')
        .leftJoinAndSelect('flightReturn.destinationAirport', 'destinationAirportReturn')
        .where('user.id = :userId', {
            userId: userId
        })
        .andWhere('(coalesce(:status) IS NULL OR booking.status = :status)', {
            status: status === 'all' ? null : status.toUpperCase()
        })
        .andWhere('(coalesce(:bookingCode) IS NULL OR (booking.bookingCode = :bookingCode))', {
            bookingCode: validateVariable(bookingCode?.trim())
        })
        .andWhere('(coalesce(:fromDate) IS NULL OR (booking.bookingDate >= DATE(:fromDate)))', {
            fromDate: validateVariable(fromDate)
        })
        .andWhere('(coalesce(:toDate) IS NULL OR (booking.bookingDate <= DATE(:toDate)))', {
            toDate: validateVariable(toDate)
        })
        .orderBy('booking.bookingCode', 'DESC')
        .getMany()

    return createPageable(bookings, pagination)
}

const bookingsCancel = async (status: string, criteria: BookingCriteria, pagination: Pagination) => {
    const { bookingCode, sourceAirportId, destinationAirportId, departureDate, arrivalDate } = criteria

    const bookingsCancel = await Booking.createQueryBuilder('booking')
        .innerJoinAndSelect('booking.flightAway', 'flightAway')
        .leftJoinAndSelect('booking.flightReturn', 'flightReturn')
        .innerJoinAndSelect('flightAway.sourceAirport', 'sourceAirportAway')
        .innerJoinAndSelect('flightAway.destinationAirport', 'destinationAirportAway')
        .leftJoinAndSelect('flightReturn.sourceAirport', 'sourceAirportReturn')
        .leftJoinAndSelect('flightReturn.destinationAirport', 'destinationAirportReturn')
        .where('(coalesce(:bookingCode) IS NULL OR booking.bookingCode = :bookingCode)', {
            bookingCode: validateVariable(bookingCode)
        })
        .andWhere('(coalesce(:status) IS NULL OR booking.status IN (:...status))', {
            status: status === 'all' ? [Status.PEN, Status.DEL] : [status.toUpperCase()]
        })
        .andWhere('(coalesce(:sourceAirportId) is null or sourceAirportAway.id = :sourceAirportId)', {
            sourceAirportId: validateVariable(sourceAirportId)
        })
        .andWhere('(coalesce(:destinationAirportId) is null or destinationAirportAway.id = :destinationAirportId)', {
            destinationAirportId: validateVariable(destinationAirportId)
        })
        .andWhere('(coalesce(:departureDate) is null or DATE(flightAway.departureTime) = DATE(:departureDate))', {
            departureDate: validateVariable(departureDate)
        })
        .andWhere('(coalesce(:arrivalDate) is null or DATE(flightAway.arrivalTime) = DATE(:arrivalDate))', {
            arrivalDate: validateVariable(arrivalDate)
        })
        .andWhere('(coalesce(:sourceAirportId) is null or sourceAirportReturn.id = :sourceAirportId)', {
            sourceAirportId: validateVariable(sourceAirportId)
        })
        .andWhere('(coalesce(:destinationAirportId) is null or destinationAirportReturn.id = :destinationAirportId)', {
            destinationAirportId: validateVariable(destinationAirportId)
        })
        .andWhere('(coalesce(:departureDate) is null or DATE(flightReturn.departureTime) = DATE(:departureDate))', {
            departureDate: validateVariable(departureDate)
        })
        .andWhere('(coalesce(:arrivalDate) is null or DATE(flightReturn.arrivalTime) = DATE(:arrivalDate))', {
            arrivalDate: validateVariable(arrivalDate)
        })
        .orderBy('booking.updatedAt', 'DESC')
        .getMany()

    return createPageable(bookingsCancel, pagination)
}

const upadateStatus = async (ids: string[], status: Status) => {
    const bookings = await Booking.find({
        where: { id: In(ids) },
        relations: { bookingSeats: true, bookingServiceOpts: true }
    })

    const errors: ErrorResponse[] = []

    if (bookings) {
        if (status === Status.DEL) {
            ids.forEach((id) => {
                const booking = bookings.find((b) => b.id === id)
                if (booking) {
                    if (booking.status === Status.PEN) {
                        const { bookingSeats, bookingServiceOpts } = booking
                        bookingSeats.forEach((bookingSeat) => {
                            bookingSeat.status = Status.DEL
                            bookingSeat.save()
                        })
                        bookingServiceOpts.forEach((bookingServiceOpt) => {
                            bookingServiceOpt.status = Status.DEL
                            bookingServiceOpt.save()
                        })
                        booking.status = Status.DEL
                    } else {
                        errors.push({ message: 'không ở trạng thái chờ hủy', data: booking })
                    }
                } else {
                    errors.push({ message: 'không tìm thấy', data: id })
                }
            })
        } else if (status === Status.ACT) {
            ids.forEach((id) => {
                const booking = bookings.find((b) => b.id === id)
                if (booking) {
                    if (booking.status === Status.PEN) {
                        booking.status = Status.ACT
                    } else {
                        errors.push({ message: 'không ở trạng thái chờ hủy', data: booking })
                    }
                } else {
                    errors.push({ message: 'không tìm thấy', data: id })
                }
            })
        }
    } else {
        errors.push({ message: 'không tìm thấy', data: ids })
    }

    if (errors.length > 0) {
        throw new BadRequestException({ errors: errors })
    }

    await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.save(bookings)
    })

    return bookings
}

const cancelBookings = async (ids: string[]) => {
    const bookings = await Booking.find({
        where: { id: In(ids) },
        relations: { bookingSeats: true, bookingServiceOpts: true }
    })
    const errors: ErrorResponse[] = []

    if (bookings) {
        ids.forEach((id) => {
            const booking = bookings.find((b) => b.id === id)
            if (booking) {
                if (booking.status === Status.ACT) {
                    const { bookingSeats, bookingServiceOpts } = booking
                    bookingSeats.forEach((bookingSeat) => {
                        bookingSeat.status = Status.DEL
                        bookingSeat.save()
                    })
                    bookingServiceOpts.forEach((bookingServiceOpt) => {
                        bookingServiceOpt.status = Status.DEL
                        bookingServiceOpt.save()
                    })
                    booking.status = Status.DEL
                    booking.note = MESSAGE_CANCEL_BOOKING
                } else {
                    errors.push({ message: 'không ở trạng thái hoạt động', data: booking })
                }
            } else {
                errors.push({ message: 'không tìm thấy', data: id })
            }
        })
    } else {
        errors.push({ message: 'không tìm thấy', data: ids })
    }

    if (errors.length > 0) {
        throw new BadRequestException({ errors: errors })
    }

    await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.save(bookings)
    })

    return bookings
}

const bookings = async (criteria: BookingCriteria, pagination: Pagination) => {
    const { bookingCode, sourceAirportId, destinationAirportId, departureDate, arrivalDate } = criteria
    const bookings = await Booking.createQueryBuilder('booking')
        .innerJoinAndSelect('booking.flightAway', 'flightAway')
        .leftJoinAndSelect('booking.flightReturn', 'flightReturn')
        .innerJoinAndSelect('flightAway.sourceAirport', 'sourceAirportAway')
        .innerJoinAndSelect('flightAway.destinationAirport', 'destinationAirportAway')
        .leftJoinAndSelect('flightReturn.sourceAirport', 'sourceAirportReturn')
        .leftJoinAndSelect('flightReturn.destinationAirport', 'destinationAirportReturn')
        .where('booking.status = :status', {
            status: Status.ACT
        })
        .andWhere('(coalesce(:bookingCode) IS NULL OR booking.bookingCode = :bookingCode)', {
            bookingCode: validateVariable(bookingCode)
        })
        .andWhere('(coalesce(:sourceAirportId) is null or sourceAirportAway.id = :sourceAirportId)', {
            sourceAirportId: validateVariable(sourceAirportId)
        })
        .andWhere('(coalesce(:destinationAirportId) is null or destinationAirportAway.id = :destinationAirportId)', {
            destinationAirportId: validateVariable(destinationAirportId)
        })
        .andWhere('(coalesce(:departureDate) is null or DATE(flightAway.departureTime) = DATE(:departureDate))', {
            departureDate: validateVariable(departureDate)
        })
        .andWhere('(coalesce(:arrivalDate) is null or DATE(flightAway.arrivalTime) = DATE(:arrivalDate))', {
            arrivalDate: validateVariable(arrivalDate)
        })
        .andWhere('(coalesce(:sourceAirportId) is null or sourceAirportReturn.id = :sourceAirportId)', {
            sourceAirportId: validateVariable(sourceAirportId)
        })
        .andWhere('(coalesce(:destinationAirportId) is null or destinationAirportReturn.id = :destinationAirportId)', {
            destinationAirportId: validateVariable(destinationAirportId)
        })
        .andWhere('(coalesce(:departureDate) is null or DATE(flightReturn.departureTime) = DATE(:departureDate))', {
            departureDate: validateVariable(departureDate)
        })
        .andWhere('(coalesce(:arrivalDate) is null or DATE(flightReturn.arrivalTime) = DATE(:arrivalDate))', {
            arrivalDate: validateVariable(arrivalDate)
        })
        .orderBy('booking.bookingDate', 'DESC')
        .getMany()

    return createPageable(bookings, pagination)
}

const updateBookingByAdmin = async (id: string, passengersInput: PassengerInput[]) => {
    const booking = await Booking.findOne({
        where: { id },
        relations: { passengers: true }
    })
    if (!booking) {
        throw new NotFoundException({ message: 'không tìm thấy chuyến bay' })
    } else if (booking.status !== Status.ACT) {
        throw new BadRequestException({ error: { message: 'không ở trạng thái hoạt động' } })
    }

    const { passengers } = booking
    passengers.forEach((passenger) => {
        const passengerSave = passengersInput.find((p) => p.passengerId === passenger.id)
        if (passengerSave) {
            if (passenger.passengerType === PassengerType.ADULT) {
                passengerSave.firstName && (passenger.firstName = passengerSave.firstName)
                passengerSave.lastName && (passenger.lastName = passengerSave.lastName)
                passengerSave.dateOfBirth && (passenger.dateOfBirth = passengerSave.dateOfBirth)
                passengerSave.country && (passenger.country = passengerSave.country)
                passengerSave.phoneNumber && (passenger.phoneNumber = passengerSave.phoneNumber)
                passengerSave.email && (passenger.email = passengerSave.email)
                passengerSave.address && (passenger.address = passengerSave.address)
                passenger.save()
            } else {
                passengerSave.firstName && (passenger.firstName = passengerSave.firstName)
                passengerSave.lastName && (passenger.lastName = passengerSave.lastName)
                passengerSave.dateOfBirth && (passenger.dateOfBirth = passengerSave.dateOfBirth)
                passenger.save()
            }
        }
    })

    return booking
}

export const BookingService = {
    booking,
    bookingDetail,
    bookingCancel,
    updateBooking,
    bookingAddService,
    myBooking,
    bookingsCancel,
    upadateStatus,
    cancelBookings,
    bookings,
    updateBookingByAdmin
}
