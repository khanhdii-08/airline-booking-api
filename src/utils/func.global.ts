export const getValueByKey = (value: string, T: any) => {
    const indexOf = Object.keys(T).indexOf(value)

    if (indexOf === -1) {
        throw new Error('Invalid enum value')
    }

    const result = Object.values(T)[indexOf]
    return result
}
