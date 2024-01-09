import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Aircraft, Airport, ServiceOption } from '~/entities'

@Entity({ name: 'airline' })
export class Airline extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ name: 'airline_code' })
    airlineCode: string

    @Column({ name: 'airline_name' })
    airlineName: string

    @Column({ name: 'avatar_url' })
    avatarUrl: string

    @OneToMany(() => Airport, (airport: Airport) => airport.airline)
    airports: Airport[]

    @OneToMany(() => Aircraft, (aircraft: Aircraft) => aircraft.airline)
    aircrafts: Aircraft[]

    @OneToMany(() => ServiceOption, (serviceOption: ServiceOption) => serviceOption.airline)
    serviceOptions: ServiceOption[]
}
