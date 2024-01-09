import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm'
import Model from './model.entity'
import { ServiceOption, Booking, Passenger, Flight } from '~/entities'
import { Status } from '~/utils/enums'

@Entity({ name: 'booking_service_opt' })
export class BookingServiceOpt extends Model {
    @ManyToOne(() => Booking, (booking: Booking) => booking.bookingServiceOpts)
    @JoinColumn({ name: 'booking_id' })
    booking: Booking

    @ManyToOne(() => ServiceOption, (serviceOption: ServiceOption) => serviceOption.bookingServiceOpts)
    @JoinColumn({ name: 'service_option_id' })
    serviceOption: ServiceOption

    @ManyToOne(() => Passenger, (passenger: Passenger) => passenger.bookingServiceOpts)
    @JoinColumn({ name: 'passenger_id' })
    passenger: Passenger

    @ManyToOne(() => Flight, (flight: Flight) => flight.bookingServiceOpts)
    @JoinColumn({ name: 'flight_id' })
    flight: Flight

    @Column({ name: 'quantity', type: 'int', nullable: true })
    quantity: number

    @Column({ name: 'status', nullable: true })
    status: Status
}
