import { Flight, Seat, TaxService } from '~/entities'
import { SeatClass } from '~/utils/enums'
import Model from './model.entity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

@Entity({ name: 'flight_seat_price' })
export class FlightSeatPrice extends Model {
    @ManyToOne(() => Flight, (flight: Flight) => flight.flightSeatPrices)
    @JoinColumn({ name: 'flight_id' })
    flight: Flight

    @ManyToOne(() => Seat, (seat: Seat) => seat.flightSeatPrices)
    @JoinColumn({ name: 'seat_id' })
    seat: Seat

    @ManyToOne(() => TaxService, (taxService: TaxService) => taxService.flightSeatPrices)
    @JoinColumn({ name: 'tax_service_id' })
    taxService: TaxService

    @Column({ name: 'infant_price', type: 'float8' })
    infantPrice: number

    @Column({ name: 'adult_price', type: 'float8' })
    adultPrice: number

    @Column({ name: 'children_price', type: 'float' })
    childrenPrice: number

    @Column({ name: 'tax_price', type: 'float', nullable: true })
    taxPrice: number

    @Column({ name: 'seat_class' })
    seatClass: SeatClass
}
