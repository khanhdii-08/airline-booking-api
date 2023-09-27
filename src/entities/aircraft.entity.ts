import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Airline } from '~/entities'

@Entity()
export class Aircraft extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: string

    @ManyToOne(() => Airline, (airline: Airline) => airline.id)
    @JoinColumn({ name: 'airline_id' })
    airlineId: string

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
