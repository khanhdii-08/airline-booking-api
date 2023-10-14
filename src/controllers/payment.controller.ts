import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { PaymentService } from '~/services/payment.service'
import { PaymentInput } from '~/types/PaymentInput'

const paymentVnPay = async (req: Request<ParamsDictionary, any, any, PaymentInput>, res: Response) => {
    const paymentInput: PaymentInput = req.body
    paymentInput.ipAddr = req.ip
    paymentInput.language = req.locale

    const result = await PaymentService.paymentVNPay(paymentInput)

    return res.status(200).json(result)
}

const VnPayReturn = async (req: Request, res: Response) => {
    const vnp_Params = req.query as { [key: string]: any }
    const secureHash = vnp_Params['vnp_SecureHash']

    delete vnp_Params['vnp_SecureHash']
    delete vnp_Params['vnp_SecureHashType']

    const result = PaymentService.VnPayReturn(vnp_Params, secureHash)

    return res.status(200).json(result)
}

export const PaymentController = { paymentVnPay, VnPayReturn }
