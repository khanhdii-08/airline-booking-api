import { Pagination } from './../types/Pagination'
import { StatisticalCriteria } from './../types/criterias/StatisticalCriteria'
import { Airport, Booking, Flight, Passenger, Seat, User } from '~/entities'
import { createPageable, validateVariable } from '~/utils/common.utils'
import { Status, UserType } from '~/utils/enums'

const reportClient = async () => {
    const { totalRevenue } = await Booking.createQueryBuilder('booking')
        .select('COALESCE(sum(booking.amountTotal), 0)', 'totalRevenue')
        .where('date(booking.bookingDate) = date(:now)', {
            now: new Date()
        })
        .andWhere('booking.status in (:...status)', {
            status: [Status.ACT, Status.PEN]
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
        .where('date(booking.bookingDate) = date(:now)', {
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
        .andWhere('booking.status in (:...status)', {
            status: [Status.ACT, Status.PEN]
        })
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

const statisticalClient = async (criteria: StatisticalCriteria) => {
    const { fromDate, toDate } = criteria
    const { totalRevenue } = await Booking.createQueryBuilder('booking')
        .select('COALESCE(sum(booking.amountTotal), 0)', 'totalRevenue')
        .where('(coalesce(:fromDate) is null or DATE(booking.bookingDate) >= DATE(:fromDate))', {
            fromDate: validateVariable(fromDate)
        })
        .andWhere('(coalesce(:toDate) is null or DATE(booking.bookingDate) <= DATE(:toDate))', {
            toDate: validateVariable(toDate)
        })
        .andWhere('booking.status in (:...status)', {
            status: [Status.ACT, Status.PEN]
        })
        .getRawOne()

    // const { totalUser } = await User.createQueryBuilder('user')
    //     .select('COALESCE(count(user.id), 0)', 'totalUser')
    //     .where('user.userType = :userType', { userType: UserType.CUSTOMER })
    //     .andWhere('user.isActived = true')
    //     .andWhere('(coalesce(:fromDate) is null or DATE(booking.bookingDate) >= DATE(:fromDate))', {
    //         fromDate: validateVariable(fromDate)
    //     })
    //     .andWhere('(coalesce(:toDate) is null or DATE(booking.bookingDate) <= DATE(:toDate))', {
    //         toDate: validateVariable(toDate)
    //     })
    //     .getRawOne()

    const { totalUser } = await Passenger.createQueryBuilder('passenger')
        .innerJoin('passenger.user', 'user')
        .select('COALESCE(count(user.id), 0)', 'totalUser')
        .where('user.userType = :userType', { userType: UserType.CUSTOMER })
        .andWhere('user.isActived = true')
        .andWhere('(coalesce(:fromDate) is null or DATE(passenger.createdAt) >= DATE(:fromDate))', {
            fromDate: validateVariable(fromDate)
        })
        .andWhere('(coalesce(:toDate) is null or DATE(passenger.createdAt) <= DATE(:toDate))', {
            toDate: validateVariable(toDate)
        })
        .getRawOne()

    const { totalOrder } = await Booking.createQueryBuilder('booking')
        .select('count(booking.id)', 'totalOrder')
        .where('(coalesce(:fromDate) is null or DATE(booking.bookingDate) >= DATE(:fromDate))', {
            fromDate: validateVariable(fromDate)
        })
        .andWhere('(coalesce(:toDate) is null or DATE(booking.bookingDate) <= DATE(:toDate))', {
            toDate: validateVariable(toDate)
        })
        .andWhere('booking.status in (:...status)', {
            status: [Status.ACT, Status.PEN]
        })
        .getRawOne()

    return { totalRevenue, totalUser, totalOrder }
}

const revenueByYear = async (criteria: StatisticalCriteria) => {
    const { year } = criteria
    const bookings = await Booking.createQueryBuilder('booking')
        .select('EXTRACT(MONTH FROM booking.createdAt) AS month')
        .addSelect('EXTRACT(YEAR FROM booking.createdAt) AS year')
        .addSelect('SUM(booking.amountTotal) AS totalAmount')
        .where('EXTRACT(YEAR FROM booking.createdAt) = :year', { year })
        .andWhere('booking.status in (:...status)', {
            status: [Status.ACT, Status.PEN]
        })
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
    let yearDetail: { [key: string]: number } = {}
    let medium: number
    let maxNumber: number
    let minNumber: number

    medium = 0
    const firstBooking = bookings.find(
        (b) => Number(b.month) === Number(1) && Number(b.year) === Number(new Date().getFullYear())
    )
    maxNumber = firstBooking ? firstBooking.totalamount : 0
    minNumber = firstBooking ? firstBooking.totalamount : 0
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

        yearDetail = {
            ...yearDetail,
            [months[month]]: match ? match.totalamount : 0
        }
    }

    return {
        ...yearDetail,
        medium:
            new Date().getFullYear() === Number(year)
                ? Number((medium / currentMonth).toFixed(2))
                : Number((medium / 12).toFixed(2)),
        maxNumber,
        minNumber
    }
}

const popularFlight = async (criteria: StatisticalCriteria, pagination: Pagination) => {
    const { fromDate, toDate } = criteria
    const result = await Flight.createQueryBuilder('f')
        .leftJoin(Booking, 'b', 'f.id = b.flightAway.id OR f.id = b.flightReturn.id')
        .select([
            'f.sourceAirport as sourceAirport',
            'f.destinationAirport as destinationAirport',
            'f.flightType as flightType',
            'SUM(b.amountTotal) as totalAmount',
            'count(b.id) as totalBooking'
        ])
        .where('f.status = :flightStatus AND b.status in (:...bookingStatus)', {
            flightStatus: Status.ACT,
            bookingStatus: [Status.ACT, Status.PEN]
        })
        .andWhere('(coalesce(:fromDate) is null or DATE(f.departureTime) >= DATE(:fromDate))', {
            fromDate: validateVariable(fromDate)
        })
        .andWhere('(coalesce(:toDate) is null or DATE(f.departureTime) <= DATE(:toDate))', {
            toDate: validateVariable(toDate)
        })
        .groupBy('f.sourceAirport, f.destinationAirport, f.flightType')
        .orderBy('totalAmount', 'DESC')
        .getRawMany()

    const sourceAirportIds = result.map((e) => e.sourceairport)
    const destinationAirportIds = result.map((e) => e.destinationairport)

    if ([...sourceAirportIds, ...destinationAirportIds].length > 0) {
        const airports = await Airport.createQueryBuilder('airport')
            .innerJoinAndSelect('airport.city', 'city')
            .where('airport.id In (:...ids)', {
                ids: [...sourceAirportIds, ...destinationAirportIds]
            })
            .getMany()

        const data = result.map((e) => {
            const sourceAirport = airports.find((airport) => airport.id === e.sourceairport)
            const destinationAirport = airports.find((airport) => airport.id === e.destinationairport)
            return {
                sourceAirport,
                destinationAirport,
                flightType: e.flighttype,
                totalAmount: e.totalamount,
                totalBooking: Number(e.totalbooking)
            }
        })

        return createPageable(data, pagination)
    } else {
        return createPageable([], pagination)
    }
}

const totalBookingByYear = async (criteria: StatisticalCriteria) => {
    const { year } = criteria

    const bookings = await Booking.createQueryBuilder('booking')
        .select('EXTRACT(MONTH FROM booking.createdAt) AS month')
        .addSelect('EXTRACT(YEAR FROM booking.createdAt) AS year')
        .addSelect('count(booking.id) AS totalBooking')
        .where('EXTRACT(YEAR FROM booking.createdAt) = :year', { year })
        .andWhere('booking.status in (:...status)', {
            status: [Status.ACT, Status.PEN]
        })
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
    let yearDetail: { [key: string]: number } = {}
    let medium: number
    let maxNumber: number
    let minNumber: number

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
                medium += b.totalbooking
                if (b.totalbooking > maxNumber) {
                    maxNumber = b.totalbooking
                }
                if (b.totalbooking < minNumber) {
                    minNumber = b.totalbooking
                }
            }
        })

        yearDetail = {
            ...yearDetail,
            [months[month]]: match ? match.totalbooking : 0
        }
    }
    return {
        ...yearDetail,
        medium:
            new Date().getFullYear() === Number(year)
                ? Number((medium / currentMonth).toFixed(2))
                : Number((medium / 12).toFixed(2)),
        maxNumber,
        minNumber
    }
}

const statisticalRevenueSeat = async (criteria: StatisticalCriteria) => {
    const { fromDate, toDate } = criteria

    const queryResult = await Seat.createQueryBuilder('seat')
        .select(
            'seat.id, seat.seatClass as seatClass, seat.seatName as seatName, COUNT(booking.id) as totalBooking, sum(booking.amountTotal) as amountTotal'
        )
        .leftJoin('seat.bookings', 'booking')
        .where('(coalesce(:fromDate) is null or DATE(booking.bookingDate) >= DATE(:fromDate))', {
            fromDate: validateVariable(fromDate)
        })
        .andWhere('(coalesce(:toDate) is null or DATE(booking.bookingDate) <= DATE(:toDate))', {
            toDate: validateVariable(toDate)
        })
        .andWhere('booking.status in (:...status)', {
            status: [Status.ACT, Status.PEN]
        })
        .groupBy('seat.id')
        .getRawMany()

    const seats = await Seat.find()

    const result: any = []

    seats.forEach((seat) => {
        let data = queryResult.find((e) => e.id === seat.id)
        if (data) {
            data = {
                id: seat.id,
                seatClass: data.seatclass,
                seatName: data.seatname,
                totalBooking: Number(data.totalbooking),
                amountTotal: Number(data.amounttotal)
            }
        } else {
            data = {
                id: seat.id,
                seatClass: seat.seatClass,
                seatName: seat.seatName,
                totalBooking: 0,
                amountTotal: 0
            }
        }
        result.push(data)
    })

    return result
}

export const AdminService = {
    reportClient,
    bookingsLimitTen,
    revenueInTwoYear,
    statisticalClient,
    revenueByYear,
    popularFlight,
    totalBookingByYear,
    statisticalRevenueSeat
}
