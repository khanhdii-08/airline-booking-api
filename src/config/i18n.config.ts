import i18n from 'i18n'
import path from 'path'

i18n.configure({
    locales: ['en', 'vi'],
    defaultLocale: 'en',
    header: 'accept-language',
    cookie: 'lang',
    directory: path.join('src/messages/languages')
})

export default i18n
