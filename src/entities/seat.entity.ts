import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { SeatClass, Status } from '~/utils/enums'

@Entity({ name: 'seat' })
export class Seat {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ name: 'sseat_code' })
    seatCode: string

    @Column({ name: 'seat_name' })
    seatName: string

    @Column({ name: 'seat_class' })
    seatClass: SeatClass

    @Column({ name: 'visual_index', nullable: true })
    visualIndex: number

    @Column({ name: 'status' })
    status: Status
}
