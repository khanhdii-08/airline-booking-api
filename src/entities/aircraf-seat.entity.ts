import { Aircraft, Seat } from '~/entities'
import { BaseEntity, JoinColumn, OneToMany } from 'typeorm'

export class AircrafSeat extends BaseEntity {
    id: string

    @OneToMany(() => Aircraft, (aircraft: Aircraft) => aircraft.id)
    @JoinColumn({ name: 'aircraft_id' })
    aircraft: Aircraft

    @OneToMany(() => Seat, (seat: Seat) => seat.id)
    @JoinColumn({ name: 'seat_id' })
    seat: Seat
}
