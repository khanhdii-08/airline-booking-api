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
import { PaymentStatus } from '~/utils/enums'
import { NotFoundException } from '~/exceptions/NotFoundException'
import { AppDataSource } from '~/config/database.config'
import { generateBookingCode, removeAccents } from '~/utils/common.utils'
import { AppError } from '~/exceptions/AppError'
import { HttpStatus } from '~/utils/httpStatus'
import { logger } from '~/config/logger.config'
import { PassengerType } from '~/utils/enums/passengerType'
import { ILike, In } from 'typeorm'

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
        ...booking,
        bookingCode,
        flightAway,
        bookingDate: new Date(),
        paymentStatus
    })

    if (flightReturn) newBooking.flightReturn = flightReturn

    if (user) newBooking.user = user

    await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
        try {
            await transactionalEntityManager.save(newBooking)

            passengers.forEach(async (passenger) => {
                const newPassenger = Passenger.create({
                    ...passenger,
                    isPasserby: true,
                    booking: newBooking
                })

                await transactionalEntityManager.save(newPassenger).then(async (passengerToSave) => {
                    passenger.seats &&
                        passenger.seats.forEach(async (seat) => {
                            await BookingSeat.create({
                                passenger: passengerToSave,
                                booking: newBooking,
                                seat: Seat.create({ id: seat.seatId }),
                                flight: Flight.create({ id: seat.flightId }),
                                ...seat
                            }).save()
                        })
                    passenger.serviceOpts &&
                        passenger.serviceOpts &&
                        passenger.serviceOpts.forEach(async (serviceOpt) => {
                            await BookingServiceOpt.create({
                                passenger: passengerToSave,
                                booking: newBooking,
                                serviceOption: ServiceOption.create({ id: serviceOpt.serviceOptId }),
                                flight: Flight.create({ id: serviceOpt.flightId }),
                                ...serviceOpt
                            }).save()
                        })
                })
            })
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
            }
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
            }
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
                }
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
                }
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

export const BookingService = { booking, bookingDetail }
