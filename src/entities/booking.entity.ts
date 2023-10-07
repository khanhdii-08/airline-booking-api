import { BookingSeat, BookingService, Flight, Passenger, PaymentTransaction, User } from '~/entities'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import Model from './model.entity'
import { JourneyType, PaymentStatus } from '~/utils/enums'

@Entity({ name: 'booking' })
export class Booking extends Model {
    @ManyToOne(() => User, (user: User) => user.bookings)
    @JoinColumn({ name: 'user_id' })
    user: User

    @ManyToOne(() => Flight, (flight: Flight) => flight.bookings)
    @JoinColumn({ name: 'flight_id' })
    flight: Flight

    @OneToMany(() => BookingSeat, (bookingSeat: BookingSeat) => bookingSeat.booking)
    bookingSeats: BookingSeat[]

    @OneToMany(() => BookingService, (bookingService: BookingService) => bookingService.booking)
    bookingServices: BookingService[]

    @OneToMany(() => PaymentTransaction, (paymentTransaction: PaymentTransaction) => paymentTransaction.booking)
    paymentTransactions: PaymentTransaction[]

    @OneToMany(() => Passenger, (passenger: Passenger) => passenger.booking)
    passengers: Passenger[]

    @ManyToOne(() => Flight, (flight: Flight) => flight.returnBookings)
    @JoinColumn({ name: 'return_flight_id' })
    returnFlight: Flight

    @Column({ name: 'booking_code' })
    bookingCode: string

    @Column({ name: 'booking_name' })
    bookingName: string

    @Column({ name: 'booking_date', type: 'date' })
    bookingDate: string

    @Column({ name: 'total_amount', type: 'float' })
    totalAmount: number

    @Column({ name: 'payment_status' })
    paymentStatus: PaymentStatus

    @Column({ name: 'journey_type' })
    journeyType: JourneyType
}