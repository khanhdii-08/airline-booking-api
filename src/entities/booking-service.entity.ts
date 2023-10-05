import { Entity, JoinColumn, ManyToOne } from 'typeorm'
import Model from './model.entity'
import { ServiceOption, Booking } from '~/entities'

@Entity({ name: 'booking_service' })
export class BookingService extends Model {
    @ManyToOne(() => Booking, (booking: Booking) => booking.bookingServices)
    @JoinColumn({ name: 'booking_id' })
    booking: Booking

    @ManyToOne(() => ServiceOption, (serviceOption: ServiceOption) => serviceOption.bookingServices)
    @JoinColumn({ name: 'service_option_id' })
    serviceOption: ServiceOption
}
