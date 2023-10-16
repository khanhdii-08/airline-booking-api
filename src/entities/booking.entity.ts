import { BookingSeat, BookingServiceOpt, Flight, Passenger, PaymentTransaction, User } from '~/entities'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import Model from './model.entity'
import { JourneyType, PaymentStatus } from '~/utils/enums'

@Entity({ name: 'booking' })
export class Booking extends Model {
    @ManyToOne(() => User, (user: User) => user.bookings)
    @JoinColumn({ name: 'user_id' })
    user: User

    @ManyToOne(() => Flight, (flight: Flight) => flight.bookingAways)
    @JoinColumn({ name: 'flight_away_id' })
    flightAway: Flight

    @OneToMany(() => BookingSeat, (bookingSeat: BookingSeat) => bookingSeat.booking)
    bookingSeats: BookingSeat[]

    @OneToMany(() => BookingServiceOpt, (bookingServiceOpt: BookingServiceOpt) => bookingServiceOpt.booking)
    bookingServiceOpts: BookingServiceOpt[]

    @OneToMany(() => Passenger, (passenger: Passenger) => passenger.booking)
    passengers: Passenger[]

    @ManyToOne(() => Flight, (flight: Flight) => flight.bookingReturns)
    @JoinColumn({ name: 'flight_return_id' })
    flightReturn: Flight

    @Column({ name: 'booking_code' })
    bookingCode: string

    @Column({ name: 'booking_date', type: 'timestamptz' })
    bookingDate: Date

    @Column({ name: 'amount_total', type: 'float', nullable: true })
    amountTotal: number

    @Column({ name: 'seat_total', type: 'int', nullable: true })
    seatTotal: number

    @Column({ name: 'payment_status' })
    paymentStatus: PaymentStatus

    @Column({ name: 'journey_type' })
    journeyType: JourneyType
}
