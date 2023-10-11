import { Booking, BookingSeat, BookingServiceOpt, Flight, Passenger, PaymentTransaction, User } from '~/entities'
import { BookingInput } from './../types/BookingInput'
import { generateCode, randomColor } from '~/utils/common.utils'
import { PaymentStatus, Status } from '~/utils/enums'
import { NotFoundException } from '~/exceptions/NotFoundException'
import { AppDataSource } from '~/config/database.config'

const booking = async (bookingInput: BookingInput) => {
    const { userId, flightId, passengers, bookingSeats, bookingServiceOpts, paymentTransaction, ...booking } =
        bookingInput

    const flight = await Flight.findOneBy({ id: flightId })
    if (!flight) {
        throw new NotFoundException({ message: 'null' })
    }

    let user = null
    if (userId) {
        user = await User.findOneBy({ id: userId })
    }

    let bookingCode: string = ''
    do {
        bookingCode = generateCode('B')
        const booking = await Booking.findOneBy({ bookingCode })

        if (booking) {
            bookingCode = ''
        }
    } while (!bookingCode)

    const newBooking = await Booking.create({
        ...booking,
        flight,
        bookingCode,
        bookingDate: new Date(),
        paymentStatus: PaymentStatus.SUCCESSFUL
    })

    if (user) newBooking.user = user

    await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.save(newBooking).then(async (booking) => {
            const passengersToSave = passengers.map((passenger) => {
                return Passenger.create({
                    ...passenger,
                    passengerCode: generateCode('P'),
                    color: randomColor(),
                    isPasserby: true,
                    booking
                })
            })

            const bookingSeatsToSave = bookingSeats.map((bookingSeat) => {
                return BookingSeat.create({ ...bookingSeat, booking })
            })

            const bookingServiceOptsToSave = bookingServiceOpts.map((bookingServiceOpt) => {
                return BookingServiceOpt.create({ ...bookingServiceOpt, booking })
            })

            const newPaymentTransaction = PaymentTransaction.create({
                ...paymentTransaction,
                transactionDate: new Date(),
                booking
            })

            await transactionalEntityManager.save(passengersToSave)
            await transactionalEntityManager.save(bookingSeatsToSave)
            await transactionalEntityManager.save(bookingServiceOptsToSave)
            await transactionalEntityManager.save(newPaymentTransaction)
        })
    })

    return booking
}

export const BookingService = { booking }
