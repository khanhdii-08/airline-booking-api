import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Airline extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ name: 'airline_code' })
    airlineCode: string

    @Column({ name: 'airline_name' })
    airlineName: string

    @Column({ name: 'avatar_url' })
    avatarUrl: string
}
