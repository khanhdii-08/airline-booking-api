import Model from './model.entity'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm'
import { Gender, Status } from '~/utils/enums'
import { Booking, BookingSeat, BookingServiceOpt, CheckIn, User } from '~/entities'
import { PassengerType } from '~/utils/enums/passengerType'

@Entity({ name: 'passenger' })
export class Passenger extends Model {
    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User

    @ManyToOne(() => Booking, (booking: Booking) => booking.passengers)
    @JoinColumn({ name: 'booking_id' })
    booking: Booking

    @OneToMany(() => BookingServiceOpt, (bookingServiceOpts: BookingServiceOpt) => bookingServiceOpts.passenger)
    bookingServiceOpts: BookingServiceOpt[]

    @OneToMany(() => BookingSeat, (bookingSeat: BookingSeat) => bookingSeat.passenger)
    bookingSeats: BookingSeat[]

    @OneToMany(() => CheckIn, (checkIn: CheckIn) => checkIn.passenger)
    checkIns: CheckIn[]

    @Column({ name: 'passenger_code', nullable: true })
    passengerCode: string

    @Column({ name: 'color', nullable: true })
    color: string

    @Column({ name: 'image_url', nullable: true })
    imageUrl: string

    @Column({ name: 'first_name' })
    firstName: string

    @Column({ name: 'last_name' })
    lastName: string

    @Column({ name: 'gender' })
    gender: Gender

    @Column({ name: 'country', nullable: true })
    country: string

    @Column({ name: 'id_card', nullable: true })
    idCard: string

    @Column({ name: 'phone_number', nullable: true })
    phoneNumber: string

    @Column({ name: 'date_of_birth', type: 'date' })
    dateOfBirth: string

    @Column({ name: 'email', nullable: true })
    email: string

    @Column({ name: 'address', nullable: true })
    address: string

    @Column({ name: 'passenger_type', nullable: true })
    passengerType: PassengerType

    @Column({ name: 'is_passerby', nullable: true })
    isPasserby: boolean

    @Column({ name: 'status' })
    status: Status
}
