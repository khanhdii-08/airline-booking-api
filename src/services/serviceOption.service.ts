import { IsNull } from 'typeorm'
import { ServiceOption } from '~/entities'
import { OptionType, Status } from '~/utils/enums'

const getAllServiceOpt = async (airlineId: string, seatId: string) => {
    const defaultBaggageOptions = await ServiceOption.find({
        where: {
            airline: { id: airlineId },
            seat: { id: seatId },
            optionType: OptionType.BAGGAGE_OPT,
            status: Status.ACT
        }
    })

    const defaultMealOptions = await ServiceOption.find({
        where: {
            airline: { id: airlineId },
            seat: { id: seatId },
            optionType: OptionType.MEAL_OPT,
            status: Status.ACT
        }
    })

    const baggageOptions = await ServiceOption.find({
        where: {
            airline: { id: airlineId },
            optionType: OptionType.BAGGAGE_OPT,
            status: Status.ACT,
            seatClass: IsNull() || '',
            seat: {
                id: IsNull() || ''
            }
        }
    })

    const mealOptions = await ServiceOption.find({
        where: {
            airline: { id: airlineId },
            optionType: OptionType.MEAL_OPT,
            status: Status.ACT,
            seatClass: IsNull() || '',
            seat: {
                id: IsNull() || ''
            }
        }
    })

    const finalResult = {
        standardOpt: {
            defaultBaggageOptions,
            defaultMealOptions
        },
        baggageOptions,
        mealOptions
    }

    return finalResult
}

export const ServiceOptService = { getAllServiceOpt }
