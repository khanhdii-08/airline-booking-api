import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import Model from './model.entity'
import { Aircraft, Seat } from '~/entities'
import { SeatClass } from '~/utils/enums'

@Entity({ name: 'aircraft_seat' })
export class AircraftSeat extends Model {
    @ManyToOne(() => Aircraft, (aircraft: Aircraft) => aircraft.aircraftSeats)
    @JoinColumn({ name: 'aircraft_id' })
    aircraft: Aircraft

    @ManyToOne(() => Seat, (seat: Seat) => seat.aircraftSeats)
    @JoinColumn({ name: 'seat_id' })
    seat: Seat

    @Column({ name: 'seat_number' })
    seatNumber: number

    @Column({ name: 'seat_class' })
    seatClass: SeatClass
}
