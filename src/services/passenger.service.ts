import { PassengerCriteria } from './../types/criterias/PassengerCriteria'
import { Passenger } from '~/entities'
import { BadRequestException } from '~/exceptions/BadRequestException'
import { NotFoundException } from '~/exceptions/NotFoundException'
import { MessageKeys } from '~/messages/MessageKeys'
import { UploadProvider } from '~/providers/upload.provider'
import { MulterFile } from '~/types/MulterFile'
import { Pagination } from '~/types/Pagination'
import { PassengerInput } from '~/types/inputs/PassengerInput'
import { createPageable, getValueByKey, removeAccents, validateVariable } from '~/utils/common.utils'
import { CLOUDINARY_AVATARS } from '~/utils/constants'
import { CountryEn, CountryVi, Status } from '~/utils/enums'

const uploadAvatar = async (file: MulterFile, userId: string) => {
    if (!file) {
        throw new BadRequestException({ error: { message: 'ko có file' } })
    }

    const result = await UploadProvider.uploadImage(file, CLOUDINARY_AVATARS)

    const passenger = await Passenger.findOneBy({ user: { id: userId }, status: Status.ACT, isPasserby: false })
    if (!passenger) {
        throw new NotFoundException({ message: 'ko tìm thấy hành khách' })
    }
    passenger.imageUrl = result.url

    passenger.save()

    return passenger
}

const update = async (userId: string, passengerInput: PassengerInput) => {
    const passenger = await Passenger.findOneBy({ user: { id: userId }, status: Status.ACT, isPasserby: false })

    if (!passenger) {
        throw new NotFoundException({ message: 'ko tìm thấy hành khách' })
    }

    passengerInput.firstName && (passenger.firstName = passengerInput.firstName)
    passengerInput.lastName && (passenger.lastName = passengerInput.lastName)
    passengerInput.dateOfBirth && (passenger.dateOfBirth = passengerInput.dateOfBirth)
    passengerInput.country && (passenger.country = passengerInput.country)
    passengerInput.gender && (passenger.gender = passengerInput.gender)
    passengerInput.email && (passenger.email = passengerInput.email)
    passengerInput.idCard && (passenger.idCard = passengerInput.idCard)

    return passenger.save()
}

const passengers = async (criteria: PassengerCriteria, pagination: Pagination) => {
    const { searchText, status, fromDate, toDate } = criteria
    const passengers = await Passenger.createQueryBuilder('passenger')
        .innerJoin('passenger.user', 'user')
        .where(
            '(coalesce(:searchText) is null or (unaccent(passenger.passengerCode) ILIKE :searchText or unaccent(passenger.firstName) ILIKE :searchText or unaccent(passenger.lastName) ILIKE :searchText or unaccent(passenger.phoneNumber) ILIKE :searchText))',
            {
                searchText: `%${removeAccents(searchText)}%`
            }
        )
        .andWhere('(coalesce(:status) is null or passenger.status = :status)', {
            status: validateVariable(status)
        })
        .andWhere('(coalesce(:fromDate) IS NULL OR (DATE(passenger.createdAt) >= DATE(:fromDate)))', {
            fromDate: validateVariable(fromDate)
        })
        .andWhere('(coalesce(:toDate) IS NULL OR (DATE(passenger.createdAt) <= DATE(:toDate)))', {
            toDate: validateVariable(toDate)
        })
        .getMany()

    return createPageable(passengers, pagination)
}

const passenger = async (id: string) => {
    const passenger = await Passenger.findOneBy({ id })
    if (!passenger) {
        throw new NotFoundException({ message: i18n.__(MessageKeys.E_PASSENGER_R000_NOTFOUND) })
    }
    return passenger
}

const updateStatus = async (id: string, status: Status) => {
    const passenger = await Passenger.findOne({ where: { id }, relations: { user: true } })
    if (!passenger) {
        throw new NotFoundException({ message: i18n.__(MessageKeys.E_PASSENGER_R000_NOTFOUND) })
    }
    if (status === Status.PEN) {
        if (passenger.status !== Status.ACT) {
            throw new BadRequestException({ error: { message: 'không nằm ở trạng thái hoạt động' } })
        }
        passenger.status = Status.PEN
        const { user } = passenger
        user.isActived = false
        passenger.save()
        user.save()
    } else if (status === Status.ACT) {
        if (passenger.status !== Status.PEN) {
            throw new BadRequestException({ error: { message: 'không nằm ở trạng thái tạm ngưng' } })
        }
        passenger.status = Status.ACT
        const { user } = passenger
        user.isActived = true
        passenger.save()
        user.save()
    }
    return passenger
}

const updatePassenger = async (id: string, passengerInput: PassengerInput) => {
    const { firstName, lastName, gender, country, idCard, dateOfBirth, email } = passengerInput
    const passenger = await Passenger.findOne({ where: { id }, relations: { user: true } })
    if (!passenger) {
        throw new NotFoundException({ message: i18n.__(MessageKeys.E_PASSENGER_R000_NOTFOUND) })
    }

    firstName && (passenger.firstName = firstName)
    lastName && (passenger.lastName = lastName)
    gender && (passenger.gender = gender)
    country && (passenger.country = country)
    idCard && (passenger.idCard = idCard)
    dateOfBirth && (passenger.dateOfBirth = dateOfBirth)
    email && (passenger.email = email)

    passenger.save()

    return passenger
}

export const PassengerService = { uploadAvatar, update, passengers, passenger, updateStatus, updatePassenger }
