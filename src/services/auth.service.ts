import jwt from 'jsonwebtoken'
import { generateCode, getValueByKey, randomColor } from '~/utils/common.utils'
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

const register = async (registerInput: RegisterInput) => {
    const { gender, password } = registerInput
    const hashedPassword = await argon2.hash(password)
    const newUser = await User.create({
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
        ...registerInput,
        passengerCode,
        gender: getValueByKey(gender, Gender) as Gender,
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
}

const generateOTP = async (userId: string) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedOtp = await argon2.hash(otp)

    const otpTime = new Date()

    console.log(otpTime)

    console.log(otpTime.toString())

    otpTime.setMinutes(otpTime.getMinutes() + 2)

    console.log(otpTime.toString())

    console.log(new Date(otpTime.toString()))

    redisClient.set(`otp:${userId}`, hashedOtp)
    redisClient.set(`otpTime:${userId}`, otpTime.toString())

    return otp
}

const verify = async (userId: string, otp: string) => {
    const savedOtp = await redisClient.get(`otp:${userId}`)

    const otpVerified = savedOtp && (await argon2.verify(savedOtp, otp))
    if (!otpVerified) {
        throw new BadRequestException({ error: { message: i18n.__(MessageKeys.E_PASSENGER_B002_OPTINVALID) } })
    }

    const expOtp = await redisClient.get(`otpTime:${userId}`)
    if (expOtp !== null) {
        const expOtpDate = new Date(expOtp)
        const currentDate = new Date()

        if (currentDate > expOtpDate) {
            throw new BadRequestException({ error: { message: 'hết hạn' } })
        }
    }
    await redisClient.del(`otp:${userId}`)
    await redisClient.del(`otpTime:${userId}`)

    const user: User = await User.findOneOrFail({ where: { id: userId } })
    user.isActived = true
    await user.save()
    const passenger = await Passenger.findOneOrFail({ where: { user: true } })

    passenger.status = Status.ACT
    passenger.save()

    const payload: JwtPayload = { _id: user.id, userRole: user.userType }

    const accessToken = createToken(payload)
    const refreshToken = createRefreshToken(payload)

    redisClient.set(`access_token:${userId}`, accessToken)
    // redisClient.expire(`access_token:${userId}`, env.JWT_EXPRIED_ACCESS_TOKEN)

    redisClient.set(`refresh_token:${userId}`, refreshToken)
    // redisClient.expire(`refresh_token:${userId}`, env.JWT_EXPRIED_REFRESH_TOKEN)

    return { access_token: accessToken, refresh_token: refreshToken }
}

export const AuthService = { register, verify, sendOTP }
