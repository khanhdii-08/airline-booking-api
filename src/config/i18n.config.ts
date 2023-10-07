import i18n from 'i18n'
import path from 'path'
import { DEFAULT_LANGUAGE, LOCALES } from '~/utils/constants'

i18n.configure({
    locales: LOCALES,
    defaultLocale: DEFAULT_LANGUAGE,
    header: 'accept-language',
    cookie: 'lang',
    directory: path.join('src/messages/languages')
})

export default i18n
