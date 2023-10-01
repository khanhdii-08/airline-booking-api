import dotenv from 'dotenv'
import { Secret } from 'jsonwebtoken'

dotenv.config()

export const env = {
    APP_PORT: process.env.APP_PORT as unknown as number,
    DB_TYPE: process.env.DB_TYPE as any,
    DB_HOST: process.env.DB_HOST as string,
    DB_PORT: process.env.DB_PORT as unknown as number,
    DB_USERNAME: process.env.DB_USERNAME as string,
    DB_PASSWORD: process.env.DB_PASSWORD as string,
    DB_NAME: process.env.DB_NAME as string,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET as Secret,
    JWT_EXPRIED_ACCESS_TOKEN: process.env.JWT_EXPRIED_ACCESS_TOKEN,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as Secret,
    JWT_EXPRIED_REFRESH_TOKEN: process.env.JWT_EXPRIED_REFRESH_TOKEN
}
