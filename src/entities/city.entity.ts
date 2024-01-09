import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity } from 'typeorm'
import { Airport } from '~/entities'

@Entity({ name: 'city' })
export class City extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: string

    @Column({ name: 'city_code' })
    cityCode: string

    @Column({ name: 'city_name' })
    cityName: string

    @OneToMany(() => Airport, (airport: Airport) => airport.city)
    airports: Airport[]
}
