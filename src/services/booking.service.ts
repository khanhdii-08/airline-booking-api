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
import { logger } from '~/config/logger.config'
import { PassengerType } from '~/utils/enums/passengerType'
import { v4 as uuidv4 } from 'uuid'
import { In } from 'typeorm'
import { BadRequestException } from '~/exceptions/BadRequestException'
import { redisClient } from '~/config/redis.config'
import { OTP_TIME_BOOKING_KEY } from '~/utils/constants'
import { UnauthorizedExeption } from '~/exceptions/UnauthorizedExeption'

const booking = async (bookingInput: BookingInput) => {
    const { userId, flightAwayId, flightReturnId, passengers, ...booking } = bookingInput

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
        try {
            await transactionalEntityManager.save(newBooking)
            await transactionalEntityManager.save(passengersToSave)
            await transactionalEntityManager.save(bookingSeatsToSave)
            await transactionalEntityManager.save(bookingServiceOptsToSave)
        } catch (error) {
            logger.error(error)
        }
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

    const { flightAway, flightReturn, ...bookingDetail } = booking

    const passengerAways = await Passenger.findBy({
        booking: {
            id: booking.id
        }
    })

    const flightSeatPriceAway = await FlightSeatPrice.findOne({
        where: { flight: { id: flightAway.id } },
        relations: { taxService: true }
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
        let seatPrice
        if (passengerAway.passengerType === PassengerType.ADULT) {
            seatPrice = flightSeatPriceAway?.adultPrice
        } else if (passengerAway.passengerType === PassengerType.CHILD) {
            seatPrice = flightSeatPriceAway?.childrenPrice
        } else {
            seatPrice = flightSeatPriceAway?.infantPrice
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
            seatPrice,
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
            where: { flight: { id: flightReturn.id } },
            relations: { taxService: true }
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
            let seatPrice
            if (passengerReturn.passengerType === PassengerType.ADULT) {
                seatPrice = flightSeatPriceReturn?.adultPrice
            } else if (passengerReturn.passengerType === PassengerType.CHILD) {
                seatPrice = flightSeatPriceReturn?.childrenPrice
            } else {
                seatPrice = flightSeatPriceReturn?.infantPrice
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
                seatPrice,
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

    const savedOtp = await redisClient.get(`${OTP_TIME_BOOKING_KEY}:${booking.id}`)
    if (!savedOtp) {
        throw new UnauthorizedExeption('yêu cầu không thể thực hiện')
    }
    await redisClient.del(`${OTP_TIME_BOOKING_KEY}:${booking.id}`)

    booking.note = note
    booking.status = Status.PEN

    await booking.save()

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
    const savedOtp = await redisClient.get(`${OTP_TIME_BOOKING_KEY}:${booking.id}`)
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
        try {
            await transactionalEntityManager.save(booking)
            await transactionalEntityManager.save(bookingSeats)
            await transactionalEntityManager.save(bookingServiceOpts)
        } catch (error) {
            logger.error(error)
        }
    })

    await redisClient.del(`${OTP_TIME_BOOKING_KEY}:${booking.id}`)

    return booking
}

export const BookingService = { booking, bookingDetail, bookingCancel, updateBooking }
