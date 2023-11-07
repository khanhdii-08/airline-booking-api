import moment from 'moment'
import { v4 } from 'uuid'
import { Pageable } from '~/types/Pageable'
import { Pagination } from '~/types/Pagination'

export const getValueByKey = (value: string, T: any) => {
    const indexOf = Object.keys(T).indexOf(value)
    const result = Object.values(T)[indexOf]
    return result
}

export const genUUID = (): string => v4()

export const randomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`

export const randomCode = (char: string, uuidStr: string): string => {
    const uuidHex: string = uuidStr.replace(/-/g, '')
    const uuidInt: number = parseInt(uuidHex, 16)
    return `${char}-${uuidInt}`
}

export const generateCode = (char: string, length: number = 6) => {
    const charset = '0123456789'
    const codeArray = []

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length)
        codeArray.push(charset[randomIndex])
    }

    const timestamp = Date.now().toString()
    const timestampDigits = Array.from(timestamp)

    for (let i = codeArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[codeArray[i], codeArray[j]] = [codeArray[j], codeArray[i]]
    }

    const uniqueCode = `${char}-${codeArray.join('')}${timestampDigits[0]}${timestampDigits[1]}`

    return uniqueCode
}

export const generateBookingCode = (): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let bookingCode = ''
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length)
        bookingCode += characters.charAt(randomIndex)
    }
    return bookingCode
}

export const removeAccents = (str: string = '') => {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toUpperCase()
}

export const generateTicketCode = (): string => {
    const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let checkInCode: string = ''

    for (let i = 0; i < 6; i++) {
        const randomIndex: number = Math.floor(Math.random() * characters.length)
        checkInCode += characters.charAt(randomIndex)
    }

    return checkInCode
}

export const formatDate = (date: Date): string => {
    return moment(date).format('DD/MM/YYYY')
}

export const formatHour = (date: Date): string => {
    return moment(date).format('HH:mm')
}

export const calculateTimeDifference = (date1: Date, date2: Date): string => {
    const moment1 = moment(date1)
    const moment2 = moment(date2)

    const differenceInMinutes = moment2.diff(moment1, 'minutes')
    const days = Math.floor(differenceInMinutes / (24 * 60))
    const remainingMinutes = differenceInMinutes % (24 * 60)
    const hours = Math.floor(remainingMinutes / 60)
    const minutes = remainingMinutes % 60

    if (days > 0) {
        return `${days} ngày ${hours} giờ ${minutes} phút`
    } else {
        return `${hours} giờ ${minutes} phút`
    }
}

export const createPageable = (list: any[], options: Pagination): Pageable => {
    const { page = 1, size = 10, sort } = options

    let clonedList = [...list]

    if (sort) {
        if (sort instanceof Array) {
            sort.forEach((s) => {
                clonedList = sorting(clonedList, s)
            })
        } else {
            clonedList = sorting(clonedList, sort)
        }
    }

    const startIndex = page === 0 ? 0 : (page - 1) * size
    const endIndex = startIndex + size

    if (startIndex >= clonedList.length) {
        return new Pageable([], 0, page, size)
    }

    return new Pageable(clonedList.slice(startIndex, endIndex), clonedList.length, page, size)
}

export const sorting = (list: any[], sort: string) => {
    const [sortBy, sortOrder] = sort.split(',')

    if (sortBy) {
        const orderMultiplier = sortOrder === 'asc' ? 1 : -1
        list.sort((a, b) => {
            if (a[sortBy] < b[sortBy]) {
                return -1 * orderMultiplier
            }
            if (a[sortBy] > b[sortBy]) {
                return 1 * orderMultiplier
            }
            return 0
        })
    }

    return list
}

export const validateVariable = (value: any) => {
    return value ? value : null
}

export const generateFlightNumber = (): string => {
    const flightNumber = Math.floor(Math.random() * 1000)
    const flightCode = `VN${flightNumber.toString().padStart(3, '0')}`
    return flightCode
}
