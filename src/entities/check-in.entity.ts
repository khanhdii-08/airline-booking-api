import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import Model from './model.entity'
import { Booking } from './booking.entity'
import { Seat } from './seat.entity'
import { Passenger } from './passenger.entity'
import { Flight } from './flight.entity'

@Entity({ name: 'check_in' })
export class CheckIn extends Model {
    @PrimaryColumn('uuid')
    id: string

    @ManyToOne(() => Booking, (booking: Booking) => booking.checkIns)
    @JoinColumn({ name: 'booking_id' })
    booking: Booking

    @ManyToOne(() => Seat, (seat: Seat) => seat.checkIns)
    @JoinColumn({ name: 'seat_id' })
    seat: Seat

    @ManyToOne(() => Passenger, (passenger: Passenger) => passenger.checkIns)
    @JoinColumn({ name: 'passenger_id' })
    passenger: Passenger

    @ManyToOne(() => Flight, (flight: Flight) => flight.checkIns)
    @JoinColumn({ name: 'flight_id' })
    flight: Flight

    @Column({ name: 'check_in_code' })
    checkInCode: string

    @Column({ name: 'check_in_time', type: 'timestamptz' })
    checkInTime: string

    @Column({ name: 'seat_code' })
    seatCode: string

    @Column({ name: 'booking_code' })
    bookingCode: string

    @Column({ name: 'status' })
    status: string
}
