import { env } from '~/config/environment.config'
import { Flight } from './../entities/flight.entity'
import nodemailer from 'nodemailer'
import { PassengerInput } from '~/types/inputs/PassengerInput'
import { calculateTimeDifference, formatDate, formatHour, removeAccents } from '~/utils/common.utils'
import { Gender } from '~/utils/enums'
import { PassengerType } from '~/utils/enums/passengerType'

const sendMailBooking = async ({
    bookingCode,
    flights,
    passengers
}: {
    bookingCode: string
    flights: Flight[]
    passengers: PassengerInput[]
}) => {
    const emails: string[] = []
    const lis: string[] = []

    passengers.forEach((passenger) => {
        passenger?.email && emails.push(passenger.email)
        passenger &&
            lis.push(
                `<li type="1">${passenger.gender === Gender.FEMALE ? 'Bà ' : 'Ông '} ${passenger.lastName} ${
                    passenger.firstName
                } (${
                    passenger.passengerType === PassengerType.ADULT
                        ? 'Người lớn'
                        : passenger.passengerType === PassengerType.CHILD
                        ? 'Trẻ em'
                        : 'Em bé'
                })</li>`
            )
    })

    const details: string[] = []

    flights.forEach((flight) => {
        flight &&
            details.push(`<div style="border: 1px solid #ccc; padding: 20px;">
            <div style="overflow: auto; width: 100%;">
                <p style="float: left; width: 50%;">CHUYẾN BAY</p>
                <p style="float: left; width: 50%;"><strong>${removeAccents(
                    flight.sourceAirport.city.cityName
                )} - ${removeAccents(flight.destinationAirport.city.cityName)}</strong></p>
            </div>
            <hr>
            <div style="display: flex;">
                <div style="width: 24%;">
                    <p style="margin: 0;"><strong>Mã đặt vé :</strong></p>
                    <p style="margin: 0 0 32px 0; color: #006885; font-size: 24px;"><b>${bookingCode}</b></p>
                    <div style="display: flex;">
                        <p style="margin: 0 ;"><strong>Vivi Airline</strong> <br> ${flight.aircraft.aircraftName}</p>
                    </div>
                </div>
                <div style=" width: 77%; display: flex;">
                    <div style="width: 30%;">
                        <p style="margin-top: 0;">${formatDate(flight.departureTime)} <br> ${formatHour(
                            flight.departureTime
                        )}</p>
                        <p>${calculateTimeDifference(flight.departureTime, flight.arrivalTime)}</p>
                        <p style="margin-bottom: 0;">${formatDate(flight.arrivalTime)} <br>${formatHour(
                            flight.arrivalTime
                        )}</p>
                    </div>
                    <div style="width: 70%;">
                        <p style="height: 70%; margin: 0 12px;"><strong>${removeAccents(
                            flight.sourceAirport.city.cityName
                        )} (${flight.sourceAirport.airportCode})</strong></p>
                        <p style="height: 30%; margin: 0 12px;"><strong>${removeAccents(
                            flight.destinationAirport.city.cityName
                        )} (${flight.destinationAirport.airportCode})</strong></p>
                    </div>
                </div>
            </div>
        </div>
        <br>`)
    })

    const html = `<!DOCTYPE html>
    <html>
    
    <head>
        <link href='https://fonts.googleapis.com/css?family=Sedgwick Ave' rel='stylesheet'>
    </head>
    
    <body>
        <div class="container" style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff;">
            <div class="header" style="background-color: #e6f4ff; text-align: center;">
                <br>
                <h1 class="text-logo"
                    style="margin: 0px; color: #185983; line-height: 130%; text-align: center; word-wrap: break-word; font-family: 'Sedgwick Ave'; font-size: 36px;">
                    Vivu Airline</h1>
                <img src="https://cdn.templates.unlayer.com/assets/1676008137280-gif.gif" alt="image" title="image"
                    style="outline: none; text-decoration: none; clear: both; display: inline-block !important; border: none; height: auto; float: none; width: 100%; max-width: 500px;">
            </div>
            <div class="info" style="text-align: center;">
                <h2 style="color: #006885;"><strong>Đặt vé của quý khách đã được xác nhận</strong></h2>
                <p>
                    Cảm ơn vì đã chọn chúng tôi,
                    <br>
                    chúng tôi hy vọng rằng có một cuộc hành trình an toàn!
                </p>
            </div>
            <h4 style="color: #006885;">THÔNG TIN CHUYẾN BAY</h4>
            <div class="booking-details" style="margin-top: 20px;">
                ${details.join(' ')}
            </div>
            <h4 style="color: #006885;">TÊN HÀNH KHÁCH:</h4>
            <div class="passenger" style="margin-bottom: 34px;">
                <ul>
                    ${lis.join(' ')}
                </ul>
            </div>
            <hr>
            <div class="footer" style="text-align: center; margin-top: 20px;">
                <p>Cảm ơn bạn đã chọn Vivu Airline. Có một cuộc hành trình tuyệt vời!</p>
                <p>Trân trọng, Vivu Airline</p>
                <p>Quý khách cần hỗ trợ? <br>1800-6789</p>
            </div>
        </div>
    </body>
    
    </html>`

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: env.EMAIL_USER,
            pass: env.EMAIL_PASS
        }
    })

    const info = await transporter.sendMail({
        from: '"Vivu Airline 🛫" <info.vivuairline@gmail.com>',
        to: emails.join(', '),
        subject: `[Vivu Airline] Vé Điện Tử Vivu Airline Của Quý Khách - Mã Đặt Chỗ ${bookingCode}`,
        html
    })
}

export const MailProvider = { sendMailBooking }
