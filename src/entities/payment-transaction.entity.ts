import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Booking } from '~/entities'
import Model from './model.entity'
import { PaymentMethod, PaymentTransactionType } from '~/utils/enums'

@Entity('payment_transaction')
export class PaymentTransaction extends Model {
    @Column({ name: 'transaction_code', nullable: true })
    transactionCode: string

    @ManyToOne(() => Booking, (booking) => booking.passengers)
    @JoinColumn({ name: 'booking_id' })
    booking: Booking

    @Column({ name: 'order_id' })
    orderId: string

    @Column({ name: 'transaction_date', type: 'date' })
    transactionDate: Date

    @Column({ name: 'transaction_info' })
    transactionInfo: string

    @Column({ name: 'transaction_amount', type: 'float' })
    transactionAmount: number

    @Column({ name: 'payment_method' })
    paymentMethod: PaymentMethod

    @Column({ name: 'payment_transaction_type' })
    paymentTransactionType: PaymentTransactionType
}
