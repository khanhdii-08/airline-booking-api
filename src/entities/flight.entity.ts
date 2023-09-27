import { Airport } from '~/entities'
import { Entity, Column, ManyToMany, JoinColumn } from 'typeorm'
import Model from './model.entity'

@Entity({ name: 'flight' })
export class Flight extends Model {
    @ManyToMany(() => Airport, (airport: Airport) => airport.id)
    @JoinColumn({ name: 'airline_id' })
    airport: Airport

    // @

    @Column({ name: 'flight_code ' })
    flightCode: string

    @Column({ name: 'flight_name ' })
    flightName: string

    departureTime: Date

    arrivalTime: Date

    // @OneToMany(() => Airport, (airport: Airport) => airport.city)
    // airports: Airport[]
}
