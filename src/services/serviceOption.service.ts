import { IsNull } from 'typeorm'
import { Flight, ServiceOption } from '~/entities'
import { OptionType, Status } from '~/utils/enums'

const getAllServiceOpt = async (flightId: string, airlineId: string, seatId: string) => {
    const flight = await Flight.findOneOrFail({
        where: { id: flightId },
        relations: {
            aircraft: {
                aircraftSeats: {
                    seat: true
                }
            },
            bookingAways: {
                bookingSeats: {
                    flight: true
                }
            },
            bookingReturns: {
                bookingSeats: {
                    flight: true
                }
            }
        }
    })

    const { aircraft, bookingAways, bookingReturns } = flight
    const { aircraftSeats, ...aircraftWithoutAircraftSeats } = aircraft

    const aircraftSeat: { [key: string]: any } = {}

    aircraftSeats.forEach((element) => {
        aircraftSeat[element.seatClass] = {
            seatNumber: element.seatNumber,
            servicePrice: element.seat.servicePrice
        }
    })

    const seatsInBooking: string[] = []
    bookingAways.concat(bookingReturns).forEach((e) =>
        e.bookingSeats.forEach((seatInBooking) => {
            if (seatInBooking.flight.id === flightId && seatInBooking.status === Status.ACT) {
                seatsInBooking.push(seatInBooking.seatCode)
            }
        })
    )

    const seatOptions = {
        seatsInBooking,
        ...aircraftWithoutAircraftSeats,
        ...aircraftSeat
    }

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
        seatOptions,
        defaultOpt: {
            defaultBaggageOptions,
            defaultMealOptions
        },
        baggageOptions,
        mealOptions
    }

    return finalResult
}

export const ServiceOptService = { getAllServiceOpt }
