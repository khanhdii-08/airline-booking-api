import fs from 'fs'
import { logger } from '~/config/logger'

const enJson = JSON.parse(fs.readFileSync('src/messages/languages/en.json', 'utf8'))
const viJson = JSON.parse(fs.readFileSync('src/messages/languages/vi.json', 'utf8'))

const commonKeys = Object.keys(enJson).filter((key) => Object.keys(viJson).includes(key))

try {
    const messageKeysObject: { [key: string]: string } = {}
    commonKeys.forEach((key) => {
        messageKeysObject[key.toUpperCase()] = key
    })

    const tsContent = `// messageKey.ts
    export const MessageKeys = ${JSON.stringify(messageKeysObject)};`

    fs.writeFileSync('src/messages/MessageKeys.ts', tsContent)

    logger.info('File "MessageKey.ts" đã được tạo thành công.')
    logger.info(messageKeysObject)
} catch (error) {
    logger.error('Đã xảy ra lỗi khi xử lý tệp JSON:', error)
}
