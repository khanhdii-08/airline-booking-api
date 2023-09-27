import Model from './model.entity'
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm'
import { Gender, Status } from '~/utils/enums'
import { User } from './user.entity'

@Entity()
export class Passenger extends Model {
    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    profile: User

    @Column({ name: 'passenger_code' })
    passengerCode: string

    @Column({ name: 'color' })
    color: string

    @Column({ name: 'image_url' })
    imageUrl: string

    @Column({ name: 'first_name' })
    firstName: string

    @Column({ name: 'last_name' })
    lastName: string

    @Column({ name: 'gender' })
    gender: Gender

    @Column({ name: 'country' })
    country: string

    @Column({ name: 'phone_number' })
    phoneNumber: string

    @Column({ name: 'date_of_birth ', type: 'date' })
    dateOfBirth: string

    @Column({ name: 'email' })
    email: string

    @Column({ name: 'is_passerby' })
    isPasserby: boolean

    @Column({ name: 'status' })
    status: Status
}
