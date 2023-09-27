import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { UserType } from '~/utils/enums'

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({ unique: true, name: 'phone_number' })
    phoneNumber!: string

    @Column({ unique: true, name: 'email' })
    email!: string

    @Column()
    password!: string

    @Column({ name: 'is_actived', default: false })
    isActived: boolean

    @Column({ name: 'user_type' })
    userType: UserType

    @Column({ default: 0 })
    tokenVersion: number
}
