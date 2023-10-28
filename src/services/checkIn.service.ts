import { Booking, CheckIn, Flight, Passenger, Seat } from '~/entities'
import { CheckInInput } from '~/types/inputs/CheckInInput'
import { NotFoundException } from '~/exceptions/NotFoundException'
import { Status } from '~/utils/enums'
import { BadRequestException } from '~/exceptions/BadRequestException'
import { generateTicketCode } from '~/utils/common.utils'
import { AppError } from '~/exceptions/AppError'
import { HttpStatus } from '~/utils/httpStatus'

const checkIn = async (checkInInput: CheckInInput) => {
    const { bookingId, flightId, passengerId, seatId, seatCode } = checkInInput

    const booking = await Booking.findOneBy({ id: bookingId })
    if (!booking) {
        throw new NotFoundException({ message: 'khong tim thay booking' })
    } else if (booking.status !== Status.ACT) {
        throw new BadRequestException({ error: { message: 'booking khong phai active' } })
    }

    const flight = await Flight.findOne({
        where: { id: flightId, status: Status.ACT },
        relations: { destinationAirport: true, sourceAirport: true }
    })
    if (!flight) {
        throw new NotFoundException({ message: 'khong tim thay chuyen bay' })
    }

    const passenger = await Passenger.findOneBy({ id: passengerId })
    if (!passenger) {
        throw new NotFoundException({ message: 'khong tim thay hanh khach' })
    }

    const seat = await Seat.findOneBy({ id: seatId })
    if (!seat) {
        throw new NotFoundException({ message: 'khong tim thay ghe' })
    }

    const checkIn = await CheckIn.findOneBy({
        booking: { id: booking.id },
        flight: { id: flight.id },
        passenger: { id: passenger.id },
        seat: { id: seat.id }
    })

    if (checkIn) {
        throw new AppError({ status: HttpStatus.CONFLICT, error: { message: 'đã được check in' } })
    }

    const doorTime = new Date(flight.departureTime.setMinutes(flight.departureTime.getMinutes() - 30))

    const newCheckIn = CheckIn.create({
        booking,
        bookingCode: booking.bookingCode,
        ticketCode: generateTicketCode(),
        checkInTime: new Date(),
        doorNumber: 1,
        doorTime,
        flight,
        passenger,
        seat,
        seatCode
    })

    return await newCheckIn.save()
}

export const CheckInService = { checkIn }
