import { v4 } from 'uuid'

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

export const removeAccents = (str: string) => {
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
