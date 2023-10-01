import { geneCode, getValueByKey, randomColor } from '~/utils/common.utils'
import { createToken } from './../utils/auth.utils'
import argon2 from 'argon2'
import { Passenger } from '~/entities'
import { User } from '~/entities/user.entity'
import { RegisterInput } from '~/types/RegisterInput'
import { Gender, UserType } from '~/utils/enums'
import { JwtPayload } from '~/types/JwtPayload'
import { AppDataSource } from '~/config/database'

const register = async (registerInput: RegisterInput) => {
    const { gender, password } = registerInput
    const hashedPassword = await argon2.hash(password)
    const newUser = await User.create({
        ...registerInput,
        password: hashedPassword,
        userType: UserType.CUSTOMER
    })
    const newPassenger = await Passenger.create({
        ...registerInput,
        passengerCode: geneCode('P'),
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
    return createToken(payload)
}

export const AuthService = { register }
