import { Entity, JoinColumn, ManyToOne } from 'typeorm'
import Model from './model.entity'
import { Booking, Seat } from '~/entities'

@Entity({ name: 'booking_seat' })
export class BookingSeat extends Model {
    @ManyToOne(() => Booking, (booking: Booking) => booking.bookingSeats)
    @JoinColumn({ name: 'booking_id' })
    booking: Booking

    @ManyToOne(() => Seat, (seat: Seat) => seat.bookingSeats)
    @JoinColumn({ name: 'seat_id' })
    seat: Seat
}
