import { Airline, BookingServiceOpt, Seat } from '~/entities'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import Model from './model.entity'
import { LuggageType, OptionType, SeatClass, Status } from '~/utils/enums'

@Entity({ name: 'service_option' })
export class ServiceOption extends Model {
    @ManyToOne(() => Airline, (airline: Airline) => airline.serviceOptions)
    @JoinColumn({ name: 'airline_id' })
    airline: Airline

    @OneToMany(() => BookingServiceOpt, (bookingServiceOpt: BookingServiceOpt) => bookingServiceOpt.serviceOption)
    bookingServiceOpts: BookingServiceOpt[]

    @ManyToOne(() => Seat, (seat: Seat) => seat.serviceOptions)
    @JoinColumn({ name: 'seat_id' })
    seat: Seat

    @Column({ name: 'option_code' })
    optionCode: string

    @Column({ name: 'option_name', nullable: true })
    optionName: string

    @Column({ name: 'option_description', nullable: true })
    optionDescription: string

    @Column({ name: 'option_image', nullable: true })
    optionImage: string

    @Column({ name: 'value', type: 'float', nullable: true })
    value: number

    @Column({ name: 'option_type' })
    optionType: OptionType

    @Column({ name: 'status' })
    status: Status

    @Column({ name: 'seat_class', nullable: true })
    seatClass: SeatClass

    @Column({ name: 'luggage_type', nullable: true })
    luggageType: LuggageType

    @Column({ name: 'option_price', type: 'float', nullable: true })
    optionPrice: number
}
