import { SeatClass } from '~/utils/enums'

export class SeatInput {
    seatId: string

    flightId: string

    seatCode: string

    seatClass: SeatClass

    seatPrice: number
}
