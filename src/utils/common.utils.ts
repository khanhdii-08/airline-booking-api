export const getValueByKey = (value: string, T: any) => {
    const indexOf = Object.keys(T).indexOf(value)
    const result = Object.values(T)[indexOf]
    return result
}

export const genId = (): string => 'a'

export const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`

export const randomCode = (char: string, uuidStr: string): string => {
    const uuidHex: string = uuidStr.replace(/-/g, '')
    const uuidInt: number = parseInt(uuidHex, 16)
    return `${char}-${uuidInt}`
}

export function geneCode(char: string) {
    const totalNumbers = 100
    const availableNumbers = Array.from({ length: totalNumbers }, (_, i) => i + 1)
    const timestamp = Date.now().toString()
    const timestampDigits = Array.from(timestamp)

    for (let i = availableNumbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[availableNumbers[i], availableNumbers[j]] = [availableNumbers[j], availableNumbers[i]]
    }
    const randomNumbers = availableNumbers.slice(0, 3)
    const uniqueCode = `${char}-${randomNumbers.join('')}${timestampDigits[0]}${timestampDigits[1]}`

    return uniqueCode
}

// const value1OrValue2 = (valOne : any, valTwo : any) => {
//     return valOne
// }
