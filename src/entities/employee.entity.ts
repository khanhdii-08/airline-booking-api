import { Entity, Column, OneToOne, JoinColumn } from 'typeorm'
import { User } from '~/entities'
import { Gender, Status } from '~/utils/enums'
import Model from './model.entity'

@Entity({ name: 'employee' })
export class Employee extends Model {
    @OneToOne(() => User, { lazy: true })
    @JoinColumn({ name: 'user_id' })
    user: User

    @Column({ name: 'employee_code' })
    employeeCode: string

    @Column({ name: 'code' })
    code: string

    @Column({ name: 'image_url' })
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

    @Column({ name: 'email' })
    email: string

    @Column({ name: 'street' })
    street: string

    @Column({ name: 'country_name' })
    countryName: string

    @Column({ name: 'province_name' })
    provinceName: string

    @Column({ name: 'district_name' })
    districtName: string

    @Column({ name: 'ward_name' })
    wardName: string

    @Column({ name: 'status' })
    status: Status
}
