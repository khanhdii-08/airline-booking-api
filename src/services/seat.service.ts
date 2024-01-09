import { AppDataSource } from '~/config/database.config'
import { Seat } from '~/entities'

const seatRepository = AppDataSource.getRepository(Seat)

const getAllSeat = async () => {
    const seats = await seatRepository.find({ order: { visualIndex: 'ASC' } })
    return seats
}

export const SeatService = { getAllSeat }
