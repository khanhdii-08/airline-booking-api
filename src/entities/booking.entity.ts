import { BookingSeat, BookingServiceOpt, CheckIn, Flight, Passenger, PaymentTransaction, Seat, User } from '~/entities'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import Model from './model.entity'
import { JourneyType, PaymentStatus, Status } from '~/utils/enums'

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

    @OneToMany(() => CheckIn, (checkIn: CheckIn) => checkIn.booking)
    checkIns: CheckIn[]

    @ManyToOne(() => Seat, (seat: Seat) => seat.bookings)
    @JoinColumn({ name: 'seat_id' })
    seat: Seat

    @OneToMany(() => PaymentTransaction, (paymentTransaction) => paymentTransaction.booking)
    paymentTransactions: PaymentTransaction[]

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

    @Column({ name: 'note', nullable: true })
    note: string

    @Column({ name: 'status', nullable: true })
    status: Status
}
