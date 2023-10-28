import { BookingCriteria } from './../types/criterias/BookingCriteria'
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
import { BookingInput } from '../types/inputs/BookingInput'
import { PaymentStatus, Status } from '~/utils/enums'
import { NotFoundException } from '~/exceptions/NotFoundException'
import { AppDataSource } from '~/config/database.config'
import { generateBookingCode, removeAccents } from '~/utils/common.utils'
import { AppError } from '~/exceptions/AppError'
import { HttpStatus } from '~/utils/httpStatus'
import { PassengerType } from '~/utils/enums/passengerType'
import { v4 as uuidv4 } from 'uuid'
import { In } from 'typeorm'
import { BadRequestException } from '~/exceptions/BadRequestException'
import { redisClient } from '~/config/redis.config'
import { UnauthorizedExeption } from '~/exceptions/UnauthorizedExeption'
import { OTP_TIME_BOOKING_CANCEL_KEY, OTP_TIME_BOOKING_UPDATE_KEY } from '~/utils/constants'

const booking = async (bookingInput: BookingInput) => {
    const { userId, flightAwayId, flightReturnId, seatId, passengers, ...booking } = bookingInput

    let bookingCode = bookingInput.bookingCode

    const flightAway = await Flight.findOneBy({ id: flightAwayId })
    if (!flightAway) {
        throw new NotFoundException({ message: 'null' })
    }

    let flightReturn = null
    if (flightReturnId) {
        flightReturn = await Flight.findOneBy({ id: flightReturnId })
        if (!flightReturn) {
            throw new NotFoundException({ message: 'null' })
        }
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
        id: uuidv4(),
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
            id: uuidv4(),
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

    return bookingInput
}

const bookingDetail = async (criteria: BookingCriteria) => {
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
        .where('booking.bookingCode = :bookingCode', { bookingCode: criteria.bookingCode.trim() })
        .andWhere('unaccent(passengers.firstName) ILIKE :firstName', {
            firstName: `%${removeAccents(criteria.firstName.trim())}%`
        })
        .andWhere('unaccent(passengers.lastName) ILIKE :lastName', {
            lastName: `%${removeAccents(criteria.lastName.trim())}%`
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
        let seat
        if (passengerAway.passengerType === PassengerType.ADULT && flightSeatPriceAway) {
            seat = {
                seatPrice: flightSeatPriceAway.adultPrice,
                taxPrice: (flightSeatPriceAway.adultPrice * 10) / 100,
                ...flightSeatPriceAway.seat
            }
        } else if (passengerAway.passengerType === PassengerType.CHILD && flightSeatPriceAway) {
            seat = {
                seatPrice: flightSeatPriceAway.childrenPrice,
                taxPrice: (flightSeatPriceAway.childrenPrice * 10) / 100,
                ...flightSeatPriceAway.seat
            }
        } else if (passengerAway.passengerType === PassengerType.INFANT && flightSeatPriceAway) {
            seat = {
                seatPrice: flightSeatPriceAway.infantPrice,
                taxPrice: 0,
                ...flightSeatPriceAway.seat
            }
        }
        const taxService = flightSeatPriceAway?.taxService
        const seatServicePrice = bookingSeatAways.find(
            (bookingSeatAway) => bookingSeatAway.passenger.id === passengerAway.id
        )?.seatPrice

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
            seatServicePrice,
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
            let seat
            if (passengerReturn.passengerType === PassengerType.ADULT && flightSeatPriceReturn) {
                seat = {
                    seatPrice: flightSeatPriceReturn.adultPrice,
                    taxPrice: (flightSeatPriceReturn.adultPrice * 10) / 100,
                    ...flightSeatPriceReturn.seat
                }
            } else if (passengerReturn.passengerType === PassengerType.CHILD && flightSeatPriceReturn) {
                seat = {
                    seatPrice: flightSeatPriceReturn.childrenPrice,
                    taxPrice: (flightSeatPriceReturn.childrenPrice * 10) / 100,
                    ...flightSeatPriceReturn.seat
                }
            } else if (passengerReturn.passengerType === PassengerType.INFANT && flightSeatPriceReturn) {
                seat = {
                    seatPrice: flightSeatPriceReturn.infantPrice,
                    taxPrice: 0,
                    ...flightSeatPriceReturn.seat
                }
            }
            const taxService = flightSeatPriceReturn?.taxService
            const seatServicePrice = bookingSeatReturns.find(
                (bookingSeatReturn) => bookingSeatReturn.passenger.id === passengerReturn.id
            )?.seatPrice

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
                seatServicePrice,
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
        throw new UnauthorizedExeption('yêu cầu không thể thực hiện')
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
        throw new UnauthorizedExeption('yêu cầu không thể thực hiện')
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
    const { bookingId, passengers, flightId, flightAwayId, flightReturnId, amountTotal, seatTotal } = bookingInput
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

export const BookingService = { booking, bookingDetail, bookingCancel, updateBooking, bookingAddService }
