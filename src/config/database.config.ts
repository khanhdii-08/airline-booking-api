import { DataSource } from 'typeorm'
import { env } from './environment.config'
import {
    Aircraft,
    Airline,
    Airport,
    City,
    Flight,
    FlightSeatPrice,
    Passenger,
    Seat,
    ServiceOption,
    User,
    AircraftSeat,
    Booking,
    BookingSeat,
    BookingServiceOpt,
    Employee,
    PaymentTransaction,
    TaxService
} from '~/entities'

const Entities = [
    City,
    Airport,
    Seat,
    User,
    Passenger,
    Airline,
    Aircraft,
    Flight,
    ServiceOption,
    FlightSeatPrice,
    AircraftSeat,
    Booking,
    BookingSeat,
    BookingServiceOpt,
    Employee,
    PaymentTransaction,
    TaxService
]

export const AppDataSource = new DataSource({
    type: env.DB_TYPE,
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [...Entities]
})
