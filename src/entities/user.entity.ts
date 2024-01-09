import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { UserType } from '~/utils/enums'
import { Booking } from '~/entities'

@Entity({ name: 'user' })
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({ unique: true, name: 'phone_number' })
    phoneNumber!: string

    @Column({ name: 'email', nullable: true })
    email: string

    @Column()
    password!: string

    @Column({ name: 'is_actived', default: false })
    isActived: boolean

    @Column({ name: 'user_type' })
    userType: UserType

    @OneToMany(() => Booking, (booking: Booking) => booking.user)
    bookings: Booking[]
}
