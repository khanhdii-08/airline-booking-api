import { AircraftSeat, BookingSeat, FlightSeatPrice } from '~/entities'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { SeatClass, Status } from '~/utils/enums'

@Entity({ name: 'seat' })
export class Seat {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @OneToMany(() => AircraftSeat, (aircraftSeat: AircraftSeat) => aircraftSeat.seat)
    aircraftSeats: AircraftSeat[]

    @OneToMany(() => FlightSeatPrice, (flightSeatPrice: FlightSeatPrice) => flightSeatPrice.seat)
    flightSeatPrices: FlightSeatPrice[]

    @OneToMany(() => BookingSeat, (bookingSeat: BookingSeat) => bookingSeat.seat)
    bookingSeats: BookingSeat[]

    @Column({ name: 'sseat_code' })
    seatCode: string

    @Column({ name: 'seat_name' })
    seatName: string

    @Column({ name: 'seat_class' })
    seatClass: SeatClass

    @Column({ name: 'visual_index', nullable: true })
    visualIndex: number

    @Column({ name: 'status' })
    status: Status
}
