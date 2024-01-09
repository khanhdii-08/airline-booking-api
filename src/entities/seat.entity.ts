import { AircraftSeat, Booking, BookingSeat, CheckIn, FlightSeatPrice, ServiceOption } from '~/entities'
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { SeatClass, Status } from '~/utils/enums'

@Entity({ name: 'seat' })
export class Seat extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @OneToMany(() => AircraftSeat, (aircraftSeat: AircraftSeat) => aircraftSeat.seat)
    aircraftSeats: AircraftSeat[]

    @OneToMany(() => FlightSeatPrice, (flightSeatPrice: FlightSeatPrice) => flightSeatPrice.seat)
    flightSeatPrices: FlightSeatPrice[]

    @OneToMany(() => BookingSeat, (bookingSeat: BookingSeat) => bookingSeat.seat)
    bookingSeats: BookingSeat[]

    @OneToMany(() => ServiceOption, (serviceOption: ServiceOption) => serviceOption.seat)
    serviceOptions: ServiceOption[]

    @OneToMany(() => Booking, (booking: Booking) => booking.seat)
    bookings: Booking[]

    @OneToMany(() => CheckIn, (checkIn: CheckIn) => checkIn.seat)
    checkIns: CheckIn[]

    @Column({ name: 'seat_name' })
    seatName: string

    @Column({ name: 'seat_class' })
    seatClass: SeatClass

    @Column({ name: 'service_price', type: 'float', nullable: true })
    servicePrice: number

    @Column({ name: 'visual_index', nullable: true })
    visualIndex: number

    @Column({ name: 'status' })
    status: Status
}
