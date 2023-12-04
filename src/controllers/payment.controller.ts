import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { PaymentService } from '~/services/payment.service'
import { PaymentInput } from '~/types/inputs/PaymentInput'
import { HttpStatus } from '~/utils/httpStatus'

const paymentVnPay = async (req: Request<ParamsDictionary, any, any, PaymentInput>, res: Response) => {
    const paymentInput: PaymentInput = req.body
    paymentInput.ipAddr = req.ip
    paymentInput.language = req.locale

    const result = await PaymentService.paymentVNPay(paymentInput)

    return res.status(HttpStatus.OK).json(result)
}

const VnPayReturn = async (req: Request, res: Response) => {
    const vnp_Params = req.query as { [key: string]: any }
    const secureHash = vnp_Params['vnp_SecureHash']

    delete vnp_Params['vnp_SecureHash']
    delete vnp_Params['vnp_SecureHashType']

    const result = await PaymentService.VnPayReturn(vnp_Params, secureHash)

    return res.status(HttpStatus.OK).json(result)
}

const paymentMomo = async (req: Request<ParamsDictionary, any, any, PaymentInput>, res: Response) => {
    const paymentInput: PaymentInput = req.body
    const result = await PaymentService.paymentMomo(paymentInput)
    return res.status(HttpStatus.OK).json(result)
}

const momoReturn = async (req: Request, res: Response) => {
    const momo_Params = req.query as { [key: string]: any }
    const result = await PaymentService.momoReturn(momo_Params)
    return res.status(HttpStatus.OK).json(result)
}

export const PaymentController = { paymentVnPay, VnPayReturn, paymentMomo, momoReturn }
