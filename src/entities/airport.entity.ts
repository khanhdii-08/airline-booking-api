import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BaseEntity, OneToMany } from 'typeorm'
import { Airline, City, Flight } from '~/entities'

@Entity({ name: 'airport' })
export class Airport extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: string

    @Column({ name: 'airport_code' })
    airportCode: string

    @Column({ name: 'airport_name' })
    airportName: string

    @Column({ name: 'visual_index', nullable: true })
    visualIndex: number

    @ManyToOne(() => City, (city: City) => city.airports)
    @JoinColumn({ name: 'city_id' })
    city: City

    @ManyToOne(() => Airline, (airline: Airline) => airline.airports)
    @JoinColumn({ name: 'airline_id' })
    airline: Airline

    @OneToMany(() => Flight, (flight: Flight) => flight.sourceAirport)
    sourceFlights: Flight[]

    @OneToMany(() => Flight, (flight: Flight) => flight.destinationAirport)
    destinationFlights: Flight[]
}
