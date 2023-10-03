import { BaseEntity, Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { UserType } from '~/utils/enums'
import { Booking, Employee, Passenger } from '~/entities'

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

    @Column({ default: 0 })
    tokenVersion: number

    @OneToOne(() => Passenger, (passenger: Passenger) => passenger.user, { lazy: true })
    @JoinColumn()
    passenger: Passenger

    @OneToOne(() => Employee, (employee: Employee) => employee.user, { lazy: true })
    @JoinColumn()
    employee: Employee

    @OneToMany(() => Booking, (booking: Booking) => booking.user)
    bookings: Booking[]
}
