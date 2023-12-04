import { PaymentMethod, PaymentTransactionType } from '~/utils/enums'

export class PaymentInput {
    ipAddr: string
    amount: number
    language: string
    returnUrl: string
    transactionCode: string
    orderId: string
    transactionDate: Date
    transactionInfo: string
    transactionAmount: number
    paymentMethod: PaymentMethod
    paymentTransactionType: PaymentTransactionType
}
