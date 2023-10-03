import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { AircraftSeat, Airline, Flight } from '~/entities'

@Entity({ name: 'aircraft' })
export class Aircraft extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @ManyToOne(() => Airline, (airline: Airline) => airline.aircrafts)
    @JoinColumn({ name: 'airline_id' })
    airline: Airline

    @OneToMany(() => Flight, (flight: Flight) => flight.aircraft)
    flights: Flight[]

    @OneToMany(() => AircraftSeat, (aircraftSeat: AircraftSeat) => aircraftSeat.aircraft)
    aircraftSeats: AircraftSeat[]

    @Column({ name: 'aircraft_code' })
    aircraftCode: string

    @Column({ name: 'aircraft_name' })
    aircraftName: string

    @Column({ name: 'capacity' })
    capacity: number

    @Column({ name: 'row_numbers' })
    rowNumbers: number

    @Column({ name: 'column_numbers' })
    columnNumbers: number

    @Column({ name: 'business_number' })
    businessNumber: number

    @Column({ name: 'economy_number' })
    economyNumber: number

    @Column({ name: 'premium_economy_number' })
    premiumEconomyNumber: number

    @Column({ name: 'type' })
    type: string
}
