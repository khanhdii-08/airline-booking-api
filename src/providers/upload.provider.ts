import cloudinary from '~/config/cloudinary.config'
import { MulterFile } from '~/types/MulterFile'

const uploadImage = async (file: MulterFile) => {
    const result = await cloudinary.uploader.upload(file.path)
    return result
}

export const UploadProvider = { uploadImage }
