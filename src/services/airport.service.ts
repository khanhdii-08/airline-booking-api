import { Airport } from '~/entities'

const getAllAirPort = async () => {
    const airports: Airport[] = await Airport.find({ relations: { city: true }, order: { visualIndex: 'ASC' } })
    return airports
}

export const AirPortService = { getAllAirPort }
