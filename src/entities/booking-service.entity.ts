import { Entity, ManyToOne } from 'typeorm'
import Model from './model.entity'
import { ServiceOption, Booking } from '~/entities'

@Entity({ name: 'booking_service' })
export class BookingService extends Model {
    @ManyToOne(() => Booking, (booking: Booking) => booking.bookingServices)
    booking: Booking

    @ManyToOne(() => ServiceOption, (serviceOption: ServiceOption) => serviceOption.bookingServices)
    serviceOption: ServiceOption
}
