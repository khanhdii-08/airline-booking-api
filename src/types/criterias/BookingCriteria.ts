import { Pagination } from '~/types/Pagination'

export interface BookingCriteria extends Pagination {
    bookingId?: string
    bookingCode?: string
    firstName?: string
    lastName?: string
    fromDate?: Date
    toDate?: Date
}
