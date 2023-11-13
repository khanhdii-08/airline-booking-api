import { PassengerCriteria } from './../types/criterias/PassengerCriteria'
import { Passenger } from '~/entities'
import { BadRequestException } from '~/exceptions/BadRequestException'
import { NotFoundException } from '~/exceptions/NotFoundException'
import { UploadProvider } from '~/providers/upload.provider'
import { MulterFile } from '~/types/MulterFile'
import { Pagination } from '~/types/Pagination'
import { PassengerInput } from '~/types/inputs/PassengerInput'
import { createPageable, removeAccents, validateVariable } from '~/utils/common.utils'
import { CLOUDINARY_AVATARS } from '~/utils/constants'
import { Status } from '~/utils/enums'

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

export const PassengerService = { uploadAvatar, update, passengers }
