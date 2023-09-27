import argon2 from 'argon2'
import { User } from '~/entities/user.entity'
import { AppError } from '~/exceptions/AppError'
import { HttpCode } from '~/exceptions/HttpCode'
import { RegisterInput } from '~/types/RegisterInput'
import { UserType } from '~/utils/enums'

const register = async (registerInput: RegisterInput) => {
    const { phoneNumber, email, firstName, lastName, imageUrl, country, gender, dateOfBirth, password } = registerInput

    const existingUser = await User.findOne({ where: [{ phoneNumber }, { email }] })

    if (existingUser) {
        throw new AppError({
            code: HttpCode.BAD_REQUEST,
            error: { message: 'Số điện thoại hoặc Email đã được đăng ký trước đó' }
        })
    }

    const hashedPassword = await argon2.hash(password)

    const newUser = User.create({
        phoneNumber,
        email,
        password: hashedPassword,
        userType: UserType.CUSTOMER
    })

    return await newUser.save()
}
