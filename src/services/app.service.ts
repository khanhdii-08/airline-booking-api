import { getValueByKey } from '~/utils/common.utils'
import { CountryEn, CountryVi } from '~/utils/enums/country.enum'

const getCountries = async (language: string) => {
    let countries
    if (language === 'vi') {
        countries = Object.keys(CountryVi).map((key: string) => ({
            countryCode: key,
            countryName: getValueByKey(key, CountryVi)
        }))
    } else if (language === 'en') {
        countries = Object.keys(CountryEn).map((key: string) => ({
            countryCode: key,
            countryName: getValueByKey(key, CountryEn)
        }))
    }
    return countries
}

export const AppService = { getCountries }
