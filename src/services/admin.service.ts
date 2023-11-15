import { Booking, Passenger, User } from '~/entities'
import { Status, UserType } from '~/utils/enums'

const reportClient = async () => {
    const { totalRevenue } = await Booking.createQueryBuilder('booking')
        .select('COALESCE(sum(booking.amountTotal), 0)', 'totalRevenue')
        .where('date(booking.createdAt) = date(now())')
        .getRawOne()

    const { totalUser } = await User.createQueryBuilder('user')
        .select('COALESCE(count(user.id), 0)', 'totalUser')
        .where('user.userType = :userType', { userType: UserType.CUSTOMER })
        .getRawOne()

    const { totalUserInMonth } = await Passenger.createQueryBuilder('passenger')
        .innerJoin('passenger.user', 'user')
        .select('COALESCE(count(user.id), 0)', 'totalUserInMonth')
        .where('user.userType = :userType', { userType: UserType.CUSTOMER })
        .andWhere('EXTRACT(MONTH FROM passenger.createdAt) = EXTRACT(MONTH FROM CURRENT_DATE)')
        .andWhere('EXTRACT(YEAR FROM passenger.createdAt) = EXTRACT(YEAR FROM CURRENT_DATE)')
        .getRawOne()

    const { totalOrderInDay } = await Booking.createQueryBuilder('booking')
        .select('count(booking.id)', 'totalOrderInDay')
        .where('date(booking.createdAt) = date(now())')
        .getRawOne()

    return { totalRevenue, totalUser, totalUserInMonth, totalOrderInDay }
}

const bookingsLimitTen = async () => {
    const query = await Booking.createQueryBuilder('booking')
        .where('booking.status = :status', { status: Status.ACT })
        .orderBy('booking.createdAt', 'DESC')
        .take(10)
        .getMany()
    return query
}

export const AdminService = { reportClient, bookingsLimitTen }
