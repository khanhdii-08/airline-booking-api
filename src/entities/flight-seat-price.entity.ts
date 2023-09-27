import { Flight, Seat } from '~/entities'
import { SeatClass } from '~/utils/enums'
import Model from './model.entity'
import { Column, Double, JoinColumn, ManyToOne } from 'typeorm'

export class FlightSeatPrice extends Model {
    @ManyToOne(() => Flight, (flight: Flight) => flight.id)
    @JoinColumn({ name: 'flight_id' })
    flight: Flight

    @ManyToOne(() => Seat, (seat: Seat) => seat.id)
    @JoinColumn({ name: 'flight_id' })
    seat: Seat

    @Column({ name: 'infant_price' })
    infantPrice: Double

    @Column({ name: 'adult_price' })
    adultPrice: Double

    @Column({ name: 'children_price' })
    childrenPrice: Double

    @Column({ name: 'seat_class' })
    seatClass: SeatClass
}
