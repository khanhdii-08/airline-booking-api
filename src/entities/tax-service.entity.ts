import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { FlightType } from '~/utils/enums'
import { FlightSeatPrice } from '~/entities'

@Entity({ name: 'tax_service' })
export class TaxService extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @OneToMany(() => FlightSeatPrice, (flightSeatPrice: FlightSeatPrice) => flightSeatPrice.taxService)
    flightSeatPrices: FlightSeatPrice[]

    @Column({ name: 'airport_fee', type: 'float' })
    airportFee: number

    @Column({ name: 'system_service_surcharge', type: 'float' })
    systemServiceSurcharge: number

    @Column({ name: 'system_administration_surcharge', type: 'float', nullable: true })
    systemAdministrationSurcharge: number

    @Column({ name: 'security_screening_fee', type: 'float' })
    securityScreeningFee: number

    @Column({ name: 'vat_tax', type: 'float' })
    VATTax: number

    @Column({ name: 'total_fee', type: 'float' })
    totalFee: number

    @Column({ name: 'fuel_charge', type: 'float', nullable: true })
    fuelCharge: number

    @Column({ name: 'flight_type' })
    flightType: FlightType
}
