import { UnauthorizedException } from '~/exceptions/UnauthorizedException'
import { env } from './environment.config'
import { CorsOptions } from 'cors'

const whitelist: string[] = env.WHITELIST_DOMAINS.split(', ')

export const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        if (!origin || whitelist.includes(origin)) {
            return callback(null, true)
        }

        return callback(new UnauthorizedException(`${origin} not allowed by our CORS Policy.`))
    },

    // Some legacy browsers (IE11, various SmartTVs) choke on 204
    optionsSuccessStatus: 200,

    // CORS sẽ cho phép nhận cookies từ request
    credentials: true
}
