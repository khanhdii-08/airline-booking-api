import jwt from 'jsonwebtoken'
import { generateCode, randomColor } from '~/utils/common.utils'
import { createRefreshToken, createToken } from '~/utils/auth.utils'
import argon2 from 'argon2'
import { Passenger } from '~/entities'
import { User } from '~/entities/user.entity'
import { RegisterInput } from '~/types/RegisterInput'
import { Gender, Status, UserType } from '~/utils/enums'
import { JwtPayload } from '~/types/JwtPayload'
import { AppDataSource } from '~/config/database.config'
import { redisClient } from '~/config/redis.config'
import { env } from '~/config/environment.config'
import { MessageKeys } from '~/messages/MessageKeys'
import i18n from '~/config/i18n.config'
import { BadRequestException } from '~/exceptions/BadRequestException'
import { ACCESS_TOKEN_KEY, OTP_KEY, OTP_TIME_KEY, REFRESH_TOKEN_KEY } from '~/utils/constants'
import { LoginInput } from '~/types/LoginInput'

const register = async (registerInput: RegisterInput) => {
    const { phoneNumber, gender, password } = registerInput

    const user = await User.findOneBy({ phoneNumber, isActived: false })

    const passenger = user && (await Passenger.findOneBy({ user: { id: user.id } }))

    const hashedPassword = await argon2.hash(password)
    const newUser = await User.create({
        ...user,
        ...registerInput,
        password: hashedPassword,
        userType: UserType.CUSTOMER
    })

    let passengerCode: string = ''
    do {
        passengerCode = generateCode('P')
        const passenger = await Passenger.findOneBy({ passengerCode, status: Status.ACT })

        if (passenger) {
            passengerCode = ''
        }
    } while (!passengerCode)

    const newPassenger = await Passenger.create({
        ...passenger,
        ...registerInput,
        passengerCode,
        gender: gender as Gender,
        color: randomColor
    })
    await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.save(newUser).then((user) => {
            newPassenger.user = user
        })
        await transactionalEntityManager.save(newPassenger)
    })

    const payload: JwtPayload = {
        _id: newUser.id,
        userRole: newUser.userType
    }
    sendOTP({ userId: newUser.id })

    return { access_token: jwt.sign(payload, env.ACCESS_TOKEN_SECRET) }
}

const sendOTP = async ({ userId }: { userId: string }) => {
    const otp = await generateOTP(userId)
    // tích hợp api sendOTP
    console.log(otp)

    return { message: 'Success' }
}

const generateOTP = async (userId: string) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedOtp = await argon2.hash(otp)

    const otpTime = new Date()
    otpTime.setMinutes(otpTime.getMinutes() + Number(env.OTP_EXPIRE_MINUTE))

    redisClient.set(`${OTP_KEY}:${userId}`, hashedOtp)
    redisClient.set(`${OTP_TIME_KEY}:${userId}`, otpTime.toString())

    return otp
}

const verify = async (userId: string, source: string, otp: string) => {
    const savedOtp = await redisClient.get(`${OTP_KEY}:${userId}`)

    const otpVerified = savedOtp && (await argon2.verify(savedOtp, otp))
    if (!otpVerified) {
        throw new BadRequestException({ error: { message: i18n.__(MessageKeys.E_PASSENGER_B002_OPTINVALID) } })
    }

    const expOtp = await redisClient.get(`${OTP_TIME_KEY}:${userId}`)
    if (expOtp !== null && new Date() > new Date(expOtp)) {
        throw new BadRequestException({ error: { message: 'hết hạn' } })
    }

    await redisClient.del(`${OTP_KEY}:${userId}`)
    await redisClient.del(`${OTP_TIME_KEY}:${userId}`)

    const user: User = await User.findOneOrFail({ where: { id: userId } })
    user.isActived = true
    await user.save()
    const passenger = await Passenger.findOneOrFail({ where: { user: true } })

    passenger.status = Status.ACT
    passenger.save()

    const payload: JwtPayload = { _id: user.id, userRole: user.userType }

    const accessToken = createToken(payload)
    const refreshToken = createRefreshToken(payload)

    redisClient.set(`${ACCESS_TOKEN_KEY}:${source}:${userId}`, accessToken)
    redisClient.set(`${REFRESH_TOKEN_KEY}:${source}:${userId}`, refreshToken)

    return { access_token: accessToken, refresh_token: refreshToken }
}

const login = async (source: string, loginInput: LoginInput) => {
    const { phoneNumber, password } = loginInput

    const user = await User.findOneBy({ phoneNumber, isActived: true })

    if (!user) {
        throw new BadRequestException({ error: { message: 'sdt ko đúng' } })
    }
    const checkPassword = user && (await argon2.verify(user.password, password))
    if (!checkPassword) {
        throw new BadRequestException({ error: { message: 'mật khẩu ko đúng' } })
    }

    const payload: JwtPayload = { _id: user.id, userRole: user.userType }

    const accessToken = createToken(payload)
    const refreshToken = createRefreshToken(payload)

    redisClient.set(`${ACCESS_TOKEN_KEY}:${source}:${user.id}`, accessToken)
    redisClient.set(`${REFRESH_TOKEN_KEY}:${source}:${user.id}`, refreshToken)

    return { access_token: accessToken, refresh_token: refreshToken }
}

export const AuthService = { register, verify, sendOTP, login }
