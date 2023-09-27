import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BaseEntity } from 'typeorm'
import { City } from '~/entities'

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
}
