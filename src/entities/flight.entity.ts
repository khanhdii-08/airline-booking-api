import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import Model from './model.entity'
import {
    Aircraft,
    Airline,
    Airport,
    Booking,
    BookingSeat,
    BookingServiceOpt,
    CheckIn,
    FlightSeatPrice
} from '~/entities'
import { Status } from '~/utils/enums'

@Entity({ name: 'flight' })
export class Flight extends Model {
    @ManyToOne(() => Airline, (airline: Airline) => airline.id)
    @JoinColumn({ name: 'airline_id' })
    airline: Airline

    @ManyToOne(() => Aircraft, (aircraft: Aircraft) => aircraft.flights)
    @JoinColumn({ name: 'aircraft_id' })
    aircraft: Aircraft

    @ManyToOne(() => Airport, (airport: Airport) => airport.sourceFlights)
    @JoinColumn({ name: 'source_airport_id' })
    sourceAirport: Airport

    @ManyToOne(() => Airport, (airport: Airport) => airport.destinationFlights)
    @JoinColumn({ name: 'destination_airport_id' })
    destinationAirport: Airport

    @OneToMany(() => FlightSeatPrice, (flightSeatPrice: FlightSeatPrice) => flightSeatPrice.flight)
    flightSeatPrices: FlightSeatPrice[]

    @OneToMany(() => Booking, (booking: Booking) => booking.flightAway)
    bookingAways: Booking[]

    @OneToMany(() => Booking, (booking: Booking) => booking.flightReturn)
    bookingReturns: Booking[]

    @OneToMany(() => BookingSeat, (bookingSeat: BookingSeat) => bookingSeat.flight)
    bookingSeats: BookingSeat[]

    @OneToMany(() => BookingServiceOpt, (bookingServiceOpt: BookingServiceOpt) => bookingServiceOpt.flight)
    bookingServiceOpts: BookingServiceOpt[]

    @OneToMany(() => CheckIn, (checkIn: CheckIn) => checkIn.flight)
    checkIns: CheckIn[]

    @Column({ name: 'flight_code' })
    flightCode: string

    @Column({ name: 'flight_name', nullable: true })
    flightName: string

    @Column({ name: 'departure_time', type: 'timestamptz', nullable: true })
    departureTime: Date

    @Column({ name: 'arrival_time', type: 'timestamptz', nullable: true })
    arrivalTime: Date

    @Column({ name: 'status', nullable: true })
    status: Status
}
