import { Passenger } from '~/entities'
import { BadRequestException } from '~/exceptions/BadRequestException'
import { NotFoundException } from '~/exceptions/NotFoundException'
import { UploadProvider } from '~/providers/upload.provider'
import { MulterFile } from '~/types/MulterFile'

const uploadAvatar = async (file: MulterFile, userId: string) => {
    if (!file) {
        throw new BadRequestException({ error: { message: 'ko có file' } })
    }

    const result = await UploadProvider.uploadImage(file)

    const passenger = await Passenger.findOneBy({ user: { id: userId } })
    if (!passenger) {
        throw new NotFoundException({ message: 'ko tìm thấy hành khách' })
    }
    passenger.imageUrl = result.url

    passenger.save()

    return passenger
}

export const PassengerService = { uploadAvatar }
