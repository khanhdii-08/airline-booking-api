import {
    Booking,
    BookingSeat,
    BookingServiceOpt,
    Flight,
    Passenger,
    PaymentTransaction,
    Seat,
    ServiceOption,
    User
} from '~/entities'
import { BookingInput } from './../types/BookingInput'
import { PaymentStatus } from '~/utils/enums'
import { NotFoundException } from '~/exceptions/NotFoundException'
import { AppDataSource } from '~/config/database.config'
import { generateBookingCode } from '~/utils/common.utils'
import { AppError } from '~/exceptions/AppError'
import { HttpStatus } from '~/utils/httpStatus'
import { logger } from '~/config/logger.config'

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
                    passenger.seats.forEach(async (seat) => {
                        await BookingSeat.create({
                            passenger: passengerToSave,
                            booking: newBooking,
                            seat: Seat.create({ id: seat.seatId }),
                            flight: Flight.create({ id: seat.flightId }),
                            ...seat
                        }).save()
                    })

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

const bookingDetail = async (bookingId: string) => {
    const booking = await Booking.findOne({
        where: { id: bookingId },
        relations: {
            flightAway: {
                sourceAirport: true,
                destinationAirport: true
            },
            flightReturn: {
                sourceAirport: true,
                destinationAirport: true
            },
            passengers: true
        }
    })
    if (!booking) {
        throw new NotFoundException({ message: 'ko tìm thấy chuyến bay' })
    }

    return booking
}

export const BookingService = { booking, bookingDetail }
