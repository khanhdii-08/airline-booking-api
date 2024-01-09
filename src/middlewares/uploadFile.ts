import multer from 'multer'
import { genUUID } from '~/utils/common.utils'

const storage = multer.diskStorage({
    filename: function (req, file, callback) {
        const fileName = genUUID() + file.originalname.slice(file.originalname.lastIndexOf('.'))
        callback(null, fileName)
    }
})

export const upload = multer({ storage: storage })
