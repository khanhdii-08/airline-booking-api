import moment from 'moment'
import crypto from 'crypto'
import qs from 'qs'
import { env } from '~/config/environment.config'
import { genUUID } from '~/utils/common.utils'
import { AppError } from '~/exceptions/AppError'
import { HttpStatus } from '~/utils/httpStatus'
import { PaymentInput } from '~/types/inputs/PaymentInput'
import axios from 'axios'
import { logger } from '~/config/logger.config'

const paymentVNPay = async (paymentInput: PaymentInput) => {
    const { amount, ipAddr, language, returnUrl } = paymentInput

    const vnpUrl = env.VNP_URL
    const tmnCode = env.VNP_TMNCODE
    const secretKey = env.VNP_HASHSECRET

    const date = new Date()
    const createDate = moment(date).format('YYYYMMDDHHmmss')

    const orderId = moment(date).format('DDHHmmss')

    let vnp_Params: { [key: string]: any } = {}

    vnp_Params['vnp_Version'] = '2.1.0'
    vnp_Params['vnp_Command'] = 'pay'
    vnp_Params['vnp_TmnCode'] = tmnCode
    vnp_Params['vnp_Amount'] = amount * 100
    vnp_Params['vnp_CreateDate'] = createDate
    vnp_Params['vnp_CurrCode'] = 'VND'
    vnp_Params['vnp_IpAddr'] = ipAddr
    vnp_Params['vnp_OrderType'] = 'other'
    vnp_Params['vnp_Locale'] = language === 'en' ? language : 'vn'
    vnp_Params['vnp_OrderInfo'] = `Thanh toan ve may bay cho ma dat ve ${orderId} tai Vivu Airline`
    vnp_Params['vnp_ReturnUrl'] = returnUrl
    vnp_Params['vnp_TxnRef'] = orderId

    vnp_Params = sortObject(vnp_Params)

    const signData = qs.stringify(vnp_Params, { encode: false })
    const hmac = crypto.createHmac('sha512', secretKey)
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')
    vnp_Params['vnp_SecureHash'] = signed

    const redirectUrl = `${vnpUrl}?${qs.stringify(vnp_Params, { encode: false })}`

    return { paymentLink: redirectUrl }
}

const VnPayReturn = async (vnp_Params: { [key: string]: any }, secureHash: string) => {
    const sortedParams = sortObject(vnp_Params)
    const secretKey = env.VNP_HASHSECRET

    const signData = qs.stringify(sortedParams, { encode: false })
    const hmac = crypto.createHmac('sha512', secretKey)
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

    if (secureHash === signed) {
        const vnp_ResponseCode = vnp_Params['vnp_ResponseCode']
        if (vnp_ResponseCode == '00') {
            return {
                status: 'success',
                code: vnp_ResponseCode
            }
        } else {
            throw new AppError({ status: HttpStatus.PAYMENT_REQUIRED })
        }
    } else {
        throw new AppError({ status: HttpStatus.PAYMENT_REQUIRED })
    }
}

const paymentMomo = async (paymentInput: PaymentInput) => {
    const { amount, returnUrl } = paymentInput

    const momoUrl = env.MOMO_URL
    const partnerCode = env.MOMO_PARTNER_CODE
    const secretKey = env.MOMO_SECRET_KEY
    const accessKey = env.MOMO_ACCESS_KEY

    const date = new Date()
    const requestId = genUUID()

    const orderId = moment(date).format('DDHHmmss')

    const momo_Params: { [key: string]: any } = {}

    momo_Params['accessKey'] = accessKey
    momo_Params['amount'] = amount
    momo_Params['extraData'] = ''
    momo_Params['ipnUrl'] = '192.168.1.3'
    momo_Params['orderId'] = orderId
    momo_Params['orderInfo'] = 'Thanh toan cho ma GD:' + orderId
    momo_Params['partnerCode'] = partnerCode
    momo_Params['redirectUrl'] = returnUrl
    momo_Params['requestId'] = requestId
    momo_Params['requestType'] = 'captureWallet'

    const signData = qs.stringify(momo_Params, { encode: false })
    const hmac = crypto.createHmac('sha256', secretKey)
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')
    momo_Params['signature'] = signed

    delete momo_Params['accessKey']

    momo_Params['lang'] = 'vi'
    momo_Params['storeName'] = 'VivuAirline'

    const res = await axios.post(`${momoUrl}/v2/gateway/api/create`, momo_Params)

    return { paymentLink: res.data.payUrl }
}

const momoReturn = async (momo_Params: { [key: string]: any }, signature: string) => {
    const resultCode = momo_Params['resultCode']
    if (resultCode == '0') {
        return {
            status: 'success',
            code: resultCode
        }
    } else {
        throw new AppError({ status: HttpStatus.PAYMENT_REQUIRED })
    }
}

const sortObject = (obj: { [key: string]: any }): { [key: string]: any } => {
    const sorted: { [key: string]: any } = {}
    const str: string[] = []
    let key

    for (key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            str.push(encodeURIComponent(key))
        }
    }

    str.sort()

    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+')
    }

    return sorted
}

export const PaymentService = { paymentVNPay, VnPayReturn, paymentMomo, momoReturn }
