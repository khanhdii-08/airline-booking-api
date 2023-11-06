import { Aircraft } from '~/entities'
import { AircraftCriteria } from '~/types/criterias/AircraftCriteria'
import { Status } from '~/utils/enums'

const aircrafts = async (criteria: AircraftCriteria) => {
    const { arrivalTime, departureTime } = criteria
    const availableAircraft = await Aircraft.createQueryBuilder('a')
        .where((qb) => {
            const subQuery = qb
                .subQuery()
                .select('1')
                .from('flight', 'f')
                .where('f.aircraft.id = a.id')
                .andWhere('f.departureTime <= :arrivalTime', { arrivalTime: arrivalTime && new Date(arrivalTime) })
                .andWhere(':departureTime <= f.arrivalTime', {
                    departureTime: departureTime && new Date(departureTime)
                })
                .andWhere('f.status != :status', { status: Status.COMPLETED })
                .getQuery()
            return 'NOT EXISTS ' + subQuery
        })
        .getMany()

    return availableAircraft
}

export const AircraftService = { aircrafts }
