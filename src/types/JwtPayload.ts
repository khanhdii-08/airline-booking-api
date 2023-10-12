import { UserType } from '~/utils/enums'

export type JwtPayload = {
    _id: string
    role: UserType
}
