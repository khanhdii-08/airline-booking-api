import { Entity, ManyToOne } from 'typeorm'
import Model from './model.entity'
import { Booking, Seat } from '~/entities'

@Entity({ name: 'booking_seat' })
export class BookingSeat extends Model {
    @ManyToOne(() => Booking, (booking: Booking) => booking.bookingSeats)
    booking: Booking

    @ManyToOne(() => Seat, (seat: Seat) => seat.bookingSeats)
    seat: Seat
}
