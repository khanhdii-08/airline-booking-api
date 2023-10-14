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

const booking = async (bookingInput: BookingInput) => {
    const { userId, flightId, passengers, paymentTransaction, ...booking } = bookingInput

    const flight = await Flight.findOneBy({ id: flightId })
    if (!flight) {
        throw new NotFoundException({ message: 'null' })
    }

    let user = null
    if (userId) {
        user = await User.findOneBy({ id: userId })
    }

    const newBooking = await Booking.create({
        ...booking,
        flight,
        bookingDate: new Date(),
        paymentStatus: PaymentStatus.SUCCESSFUL
    })

    if (user) newBooking.user = user

    await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.save(newBooking).then(async (booking) => {
            const bookingSeatsToSave: BookingSeat[] = []
            const bookingServiceOptsToSave: BookingServiceOpt[] = []

            passengers.forEach(async (passenger) => {
                const newPassenger = Passenger.create({
                    ...passenger,
                    isPasserby: true,
                    booking
                })

                const newBookingSeat = BookingSeat.create({
                    booking,
                    seat: Seat.create({ id: passenger.seat.seatId }),
                    ...passenger.seat
                })

                passenger.serviceOptIds.forEach((id) => {
                    bookingServiceOptsToSave.push(
                        BookingServiceOpt.create({
                            booking,
                            serviceOption: ServiceOption.create({ id })
                        })
                    )
                })

                await transactionalEntityManager.save(newPassenger).then(async (passenger) => {
                    newBookingSeat.passenger = passenger
                    bookingSeatsToSave.push(newBookingSeat)

                    bookingServiceOptsToSave.forEach((element) => {
                        element.passenger = passenger
                    })

                    await transactionalEntityManager.save(bookingSeatsToSave)
                    await transactionalEntityManager.save(bookingServiceOptsToSave)
                })
            })

            const newPaymentTransaction = PaymentTransaction.create({
                ...paymentTransaction,
                transactionDate: new Date(),
                booking
            })

            await transactionalEntityManager.save(newPaymentTransaction)
        })
    })

    return bookingInput
}

export const BookingService = { booking }
