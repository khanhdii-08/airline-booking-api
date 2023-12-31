// MessageKey.ts
export const MessageKeys = {
    E_EXPRESS_V000_ISEMPTY: 'e.express.v000.isEmpty',
    E_EXPRESS_V001_NOTSTRING: 'e.express.v001.notString',
    E_EXPRESS_V002_NOTNUMBER: 'e.express.v002.notNumber',
    E_EXPRESS_V003_NOTDATE: 'e.express.v003.notDate',
    E_EXPRESS_V004_ISMIN: 'e.express.v004.isMin',
    E_EXPRESS_V005_ISMAX: 'e.express.v005.isMax',
    E_ENUM_V000_INVALID: 'e.enum.v000.invalid',
    E_AUTH_V000_OTPBLANK: 'e.auth.v000.OTPBlank',
    E_AUTH_V001_OTPINVALID: 'e.auth.v001.OTPInvalid',
    E_AUTH_V002_OTPEXP: 'e.auth.v002.OTPExp',
    E_AUTH_B000_OTPNOSEND: 'e.auth.b000.OTPNoSend',
    E_AUTH_B001_ACCOUNT: 'e.auth.b001.Account',
    E_AUTH_B002_PHONENUMBERINVALID: 'e.auth.b002.phoneNumberInvalid',
    E_AUTH_B003_PASSWORDINVALID: 'e.auth.b003.passwordInvalid',
    E_AUTH_B004_ACCOUTNOTACTIVE: 'e.auth.b004.accoutNotActive',
    E_AUTH_B005_PASSOLDINVALID: 'e.auth.b005.passOldInvalid',
    E_AUTH_B006_PASSNEWCONFLICT: 'e.auth.b006.passNewConflict',
    E_PASSENGER_V000_FIRSTNAMEBLANK: 'e.passenger.v000.firstNameBlank',
    E_PASSENGER_V001_FIRSTNAMETOOLONG: 'e.passenger.v001.firstNameTooLong',
    E_PASSENGER_V002_LASTNAMEBLANK: 'e.passenger.v002.lastNameBlank',
    E_PASSENGER_V003_LASTNAMETOOLONG: 'e.passenger.v003.lastNameTooLong',
    E_PASSENGER_V004_DATEOFBIRTHBLANK: 'e.passenger.v004.dateOfBirthBlank',
    E_PASSENGER_V005_DATEOFBIRTHCORRECTFORMAT: 'e.passenger.v005.dateOfBirthCorrectFormat',
    E_PASSENGER_V006_COUNTRYBLANK: 'e.passenger.v006.countryBlank',
    E_PASSENGER_V007_COUNTRYEXIST: 'e.passenger.v007.countryExist',
    E_PASSENGER_V008_PHONENUMBERBLANK: 'e.passenger.v008.phonenumberBlank',
    E_PASSENGER_V009_PHONENUMBERCORRECTFORMAT: 'e.passenger.v009.phonenumberCorrectFormat',
    E_PASSENGER_V010_EMAILBLANK: 'e.passenger.v010.emailBlank',
    E_PASSENGER_V011_EMAILCORRECTFORMAT: 'e.passenger.v011.emailCorrectFormat',
    E_PASSENGER_V012_PASSWORDBLANK: 'e.passenger.v012.passwordBlank',
    E_PASSENGER_V013_PASSWORDLENGTH: 'e.passenger.V013.passwordLength',
    E_PASSENGER_V014_PASSWORDTOOLONG: 'e.passenger.v014.passwordTooLong',
    E_PASSENGER_B000_PHONEDUPLICATED: 'e.passenger.b000.phoneDuplicated',
    E_PASSENGER_B001_EMAILDUPLICATED: 'e.passenger.b001.emailDuplicated',
    E_PASSENGER_B002_OPTINVALID: 'e.passenger.b002.optInvalid',
    E_PASSENGER_B003_PHONEDUPLICATEDNOTACTIVE: 'e.passenger.b003.phoneDuplicatedNotActive',
    E_PASSENGER_B004_EMAILDUPLICATEDNOTACTIVE: 'e.passenger.b004.emailDuplicatedNotActive',
    E_PASSENGER_B005_NOTACTIVE: 'e.passenger.b005.notActive',
    E_PASSENGER_B006_NOTPENDING: 'e.passenger.b006.notPending',
    E_PASSENGER_B007_ISACTIVE: 'e.passenger.b007.isActive',
    E_PASSENGER_B008_ISPENDING: 'e.passenger.b008.isPending',
    E_PASSENGER_B009_ISDELETE: 'e.passenger.b009.isDelete',
    E_PASSENGER_B010_IDCARDBLANK: 'e.passenger.b010.idCardBlank',
    E_PASSENGER_R000_NOTFOUND: 'e.passenger.r000.notfound',
    E_USER_R000_NOTFOUND: 'e.user.r000.notfound',
    E_BOOKING_R000_NOTFOUND: 'e.booking.r000.notfound',
    E_BOOKING_B000_BOOKINGEXIST: 'e.booking.b000.bookingExist',
    E_BOOKING_B001_BOOKINGNOTACTIVE: 'e.booking.b001.bookingNotActive',
    E_BOOKING_B002_BOOKINGNOTCANCEL: 'e.booking.b002.bookingNotCancel',
    E_BOOKING_B002_BOOKINGNOTSCHEDULECHANGE: 'e.booking.b002.bookingNotScheduleChange',
    E_BOOKING_B003_BOOKINGNOTWAITCANCEL: 'e.booking.b003.bookingNotWaitCancel',
    E_BOOKING_B003_BOOKINGPAID: 'e.booking.b003.bookingPaid',
    E_BOOKING_B004_BOOKINGISPEN: 'e.booking.b004.bookingIsPen',
    E_BOOKING_B004_BOOKINGISDEL: 'e.booking.b004.bookingIsDel',
    E_AIRLINE_R000_NOTFOUND: 'e.airline.r000.notfound',
    E_FLIGHT_R000_NOTFOUND: 'e.flight.r000.notfound',
    E_FLIGHT_B000_NOTACTIVE: 'e.flight.b000.notActive',
    E_FLIGHT_B001_NOTPENDING: 'e.flight.b001.notPending',
    E_FLIGHT_B002_ISACTIVE: 'e.flight.b002.isActive',
    E_FLIGHT_B003_ISPENDING: 'e.flight.b003.isPending',
    E_FLIGHT_B004_ISDELETE: 'e.flight.b004.isDelete',
    E_FLIGHT_B005_CANNOTACTIVE: 'e.flight.b005.canNotActive',
    E_SEAT_R000_NOTFOUND: 'e.seat.r000.notfound',
    E_CHECKIN_B000_CHECKINEXIST: 'e.checkIn.b000.checkInExist',
    E_EMPLOYEE_R000_NOTFOUND: 'e.employee.r000.notfound',
    E_EMPLOYEE_B000_PHONEDUPLICATED: 'e.employee.b000.phoneDuplicated',
    E_EMPLOYEE_B001_PHONENOTACTIVE: 'e.employee.b001.phoneNotActive',
    E_EMPLOYEE_B002_NOTACTIVE: 'e.employee.b002.notActive',
    E_EMPLOYEE_B003_NOTPENDING: 'e.employee.b003.notPending',
    E_EMPLOYEE_B004_CREATEBYCUSTOMER: 'e.employee.b004.createByCustomer',
    E_EMPLOYEE_B005_ISACTIVE: 'e.employee.b005.isActive',
    E_EMPLOYEE_B006_ISPENDING: 'e.employee.b006.isPending',
    E_EMPLOYEE_B007_ISDELETE: 'e.employee.b007.isDelete',
    E_TAX_R000_NOTFOUND: 'e.tax.r000.notfound',
    E_FLIGHTSEATPRICE_R000_NOTFOUND: 'e.flightSeatPrice.r000.notfound',
    E_FILE_R000_NOTFOUND: 'e.file.r000.notfound',
    E_PAYMENT_B001_PAYMENTEXIST: 'e.payment.b001.paymentExist',
    E_AIRCRAFT_R000_NOTFOUND: 'e.aircraft.r000.notfound',
    E_AIRPORT_R000_SOURCENOTFOUND: 'e.airport.r000.sourceNotFound',
    E_AIRPORT_R002_DESTINATIONNOTFOUND: 'e.airport.r002.destinationNotFound'
}
