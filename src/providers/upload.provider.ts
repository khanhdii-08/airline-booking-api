import cloudinary from '~/config/cloudinary.config'
import { MulterFile } from '~/types/MulterFile'

const uploadImage = async (file: MulterFile, folder: string) => {
    const result = await cloudinary.uploader.upload(file.path, {
        folder,
        public_id: file.filename.slice(0, file.filename.lastIndexOf('.'))
    })
    return result
}

export const UploadProvider = { uploadImage }
