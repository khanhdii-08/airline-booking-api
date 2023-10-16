import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm'
import Model from './model.entity'
import { Booking, Flight, Passenger, Seat } from '~/entities'
import { SeatClass } from '~/utils/enums'

@Entity({ name: 'booking_seat' })
export class BookingSeat extends Model {
    @ManyToOne(() => Booking, (booking: Booking) => booking.bookingSeats)
    @JoinColumn({ name: 'booking_id' })
    booking: Booking

    @ManyToOne(() => Seat, (seat: Seat) => seat.bookingSeats)
    @JoinColumn({ name: 'seat_id' })
    seat: Seat

    @ManyToOne(() => Passenger, (passenger: Passenger) => passenger.bookingSeats)
    @JoinColumn({ name: 'passenger_id' })
    passenger: Passenger

    @ManyToOne(() => Flight, (flight: Flight) => flight.bookingSeats)
    @JoinColumn({ name: 'flight_id' })
    flight: Flight

    @Column({ name: 'seat_code' })
    seatCode: string

    @Column({ name: 'seat_class' })
    seatClass: SeatClass
}
