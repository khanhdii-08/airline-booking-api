import { Entity, Column, OneToOne, JoinColumn } from 'typeorm'
import { User } from '~/entities'
import { Gender, Status } from '~/utils/enums'
import Model from './model.entity'

@Entity({ name: 'employee' })
export class Employee extends Model {
    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User

    @Column({ name: 'employee_code' })
    employeeCode: string

    @Column({ name: 'image_url', nullable: true })
    imageUrl: string

    @Column({ name: 'name' })
    name: string

    @Column({ name: 'date_of_birth', type: 'date' })
    dateOfBirth: Date

    @Column({ name: 'gender' })
    gender: Gender

    @Column({ name: 'id_card' })
    idCard: string

    @Column({ name: 'phone_number' })
    phoneNumber: string

    @Column({ name: 'email', nullable: true })
    email: string

    @Column({ name: 'country', nullable: true })
    country: string

    @Column({ name: 'address', nullable: true })
    address: string

    @Column({ name: 'status' })
    status: Status
}
