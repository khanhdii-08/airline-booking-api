import { logger } from '../config/logger'
import fs from 'fs'

const enJson = JSON.parse(fs.readFileSync('src/messages/languages/en.json', 'utf8'))
const viJson = JSON.parse(fs.readFileSync('src/messages/languages/vi.json', 'utf8'))

const commonKeys = Object.keys(enJson).filter((key) => Object.keys(viJson).includes(key))

try {
    const messageKeysObject: { [key: string]: string } = {}
    commonKeys.forEach((key) => {
        messageKeysObject[key.toUpperCase().replace(/\./g, '_')] = key
    })

    const tsContent = `// MessageKey.ts
    export const MessageKeys = ${JSON.stringify(messageKeysObject, null, 2)};`

    fs.writeFileSync('src/messages/MessageKeys.ts', tsContent)

    logger.info('File "MessageKey.ts" đã được tạo thành công.')
} catch (error) {
    logger.error('Đã xảy ra lỗi khi xử lý tệp JSON:', error)
}
