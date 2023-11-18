import { Booking, Passenger, User } from '~/entities'
import { Status, UserType } from '~/utils/enums'

const reportClient = async () => {
    const { totalRevenue } = await Booking.createQueryBuilder('booking')
        .select('COALESCE(sum(booking.amountTotal), 0)', 'totalRevenue')
        .where('date(booking.bookingDate) = date(now())')
        .where('date(booking.bookingDate) = :now', {
            now: new Date()
        })
        .getRawOne()

    const { totalUser } = await User.createQueryBuilder('user')
        .select('COALESCE(count(user.id), 0)', 'totalUser')
        .where('user.userType = :userType', { userType: UserType.CUSTOMER })
        .andWhere('user.isActived = true')
        .getRawOne()

    const { totalUserInMonth } = await Passenger.createQueryBuilder('passenger')
        .innerJoin('passenger.user', 'user')
        .select('COALESCE(count(user.id), 0)', 'totalUserInMonth')
        .where('user.userType = :userType', { userType: UserType.CUSTOMER })
        .andWhere('user.isActived = true')
        .andWhere('EXTRACT(MONTH FROM passenger.createdAt) = EXTRACT(MONTH FROM CURRENT_DATE)')
        .andWhere('EXTRACT(YEAR FROM passenger.createdAt) = EXTRACT(YEAR FROM CURRENT_DATE)')
        .getRawOne()

    const { totalOrderInDay } = await Booking.createQueryBuilder('booking')
        .select('count(booking.id)', 'totalOrderInDay')
        .where('date(booking.bookingDate) = :now', {
            now: new Date()
        })
        .andWhere('booking.status in (:...status)', {
            status: [Status.ACT, Status.PEN]
        })
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

const revenueInTwoYear = async () => {
    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

    const bookings = await Booking.createQueryBuilder('booking')
        .select('EXTRACT(MONTH FROM booking.createdAt) AS month')
        .addSelect('EXTRACT(YEAR FROM booking.createdAt) AS year')
        .addSelect('SUM(booking.amountTotal) AS totalAmount')
        .where('booking.createdAt >= :twoYearsAgo', { twoYearsAgo })
        .groupBy('year, month')
        .orderBy('year', 'ASC')
        .addOrderBy('month', 'ASC')
        .getRawMany()

    const currentMonth = new Date().getMonth() + 1
    const months: string[] = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ]
    let yearOne: { [key: string]: number } = {}
    let yearTwo: { [key: string]: number } = {}
    let medium: number
    let maxNumber: number
    let minNumber: number

    medium = 0
    const firstBookingOne = bookings.find(
        (b) => Number(b.month) === Number(1) && Number(b.year) === Number(new Date().getFullYear() - 1)
    )
    maxNumber = firstBookingOne ? firstBookingOne.totalamount : 0
    minNumber = firstBookingOne ? firstBookingOne.totalamount : 0
    for (const month in months) {
        const year = new Date().getFullYear() - 1
        const match = bookings.find((b) => Number(b.month) === Number(month) + 1 && Number(b.year) === Number(year))
        bookings.forEach((b) => {
            if (Number(b.month) === Number(month) + 1 && Number(b.year) === Number(year)) {
                medium += b.totalamount
                if (b.totalamount > maxNumber) {
                    maxNumber = b.totalamount
                }
                if (b.totalamount < minNumber) {
                    minNumber = b.totalamount
                }
            }
        })

        yearOne = {
            ...yearOne,
            [months[month]]: match ? match.totalamount : 0
        }
    }
    yearOne = {
        ...yearOne,
        medium: Number((medium / 12).toFixed(2)),
        maxNumber,
        minNumber
    }

    medium = 0
    const firstBookingTwo = bookings.find(
        (b) => Number(b.month) === Number(1) && Number(b.year) === Number(new Date().getFullYear())
    )
    maxNumber = firstBookingTwo ? firstBookingTwo.totalamount : 0
    minNumber = firstBookingTwo ? firstBookingTwo.totalamount : 0
    for (const month in months) {
        const year = new Date().getFullYear()
        const match = bookings.find((b) => Number(b.month) === Number(month) + 1 && Number(b.year) === Number(year))
        bookings.forEach((b) => {
            if (
                Number(b.month) === Number(month) + 1 &&
                Number(b.year) === Number(year) &&
                Number(b.month) <= currentMonth
            ) {
                medium += b.totalamount
                if (b.totalamount > maxNumber) {
                    maxNumber = b.totalamount
                }
                if (b.totalamount < minNumber) {
                    minNumber = b.totalamount
                }
            }
        })

        yearTwo = {
            ...yearTwo,
            [months[month]]: match ? match.totalamount : 0
        }
    }

    yearTwo = {
        ...yearTwo,
        medium: Number((medium / currentMonth).toFixed(2)),
        maxNumber,
        minNumber
    }

    return { yearOne, yearTwo }
}

export const AdminService = { reportClient, bookingsLimitTen, revenueInTwoYear }
