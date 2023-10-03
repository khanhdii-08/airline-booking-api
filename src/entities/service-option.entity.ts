import { Airline, BookingService } from '~/entities'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import Model from './model.entity'
import { LuggageType, OptionType, SeatClass, Status } from '~/utils/enums'

@Entity({ name: 'service-option' })
export class ServiceOption extends Model {
    @ManyToOne(() => Airline, (airline: Airline) => airline.serviceOptions)
    @JoinColumn({ name: 'airline_id' })
    airline: Airline

    @OneToMany(() => BookingService, (bookingService: BookingService) => bookingService.serviceOption)
    @JoinColumn({ name: 'booking_service_id' })
    bookingServices: BookingService[]

    @Column({ name: 'option_code' })
    optionCode: string

    @Column({ name: 'option_name' })
    optionName: string

    @Column({ name: 'option_description' })
    optionDescription: string

    @Column({ name: 'option_image' })
    optionImage: string

    @Column({ name: 'value', type: 'float8' })
    value: number

    @Column({ name: 'option_type' })
    optionType: OptionType

    @Column({ name: 'status' })
    status: Status

    @Column({ name: 'seat_class' })
    seatClass: SeatClass

    @Column({ name: 'luggage_type' })
    luggageType: LuggageType
}
