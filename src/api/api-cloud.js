import axios from 'axios'
import dotenv from 'dotenv'
import { getValidateArray, getValidateBoolean, getValidateString } from '../assets/validate.js'
import {
  AUTO_RENEW_KEY,
  DATE_KEY,
  DOMAIN_KEY,
  LOGIN_KEY,
  NAME_KEY,
  RECORDS_KEY,
} from '../constants/index.js'
dotenv.config()

const CLOUDFLARE_ZONES_URL = process.env.CLOUDFLARE_ZONES_URL
const CLOUDFLARE_VERIFICATION_URL = process.env.CLOUDFLARE_VERIFICATION_URL
const CLOUDFLARE_GLOBAL_API_KEY = process.env.CLOUDFLARE_GLOBAL_API_KEY
const CLOUDFLARE_VERIFICATION_TOKEN = process.env.CLOUDFLARE_VERIFICATION_TOKEN
const CLOUDFLARE_DNS_RECORDS = process.env.CLOUDFLARE_DNS_RECORDS
const CLOUDFLARE_EMAIL = process.env.CLOUDFLARE_EMAIL

export const getIdVerification = async () => {
  try {
    const response = await axios.get(CLOUDFLARE_VERIFICATION_URL, {
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_VERIFICATION_TOKEN}`,
        Accept: 'application/json',
      },
    })
    return response?.data?.result
  } catch (error) {
    console.error('❌ Ошибка запроса:', error.response ? error.response.data : error.message)
    throw error
  }
}

export const getDNSRecords = async (zoneId) => {
  const url = `${CLOUDFLARE_ZONES_URL}/${zoneId}/${CLOUDFLARE_DNS_RECORDS}`
  try {
    const response = await axios.get(url, {
      headers: {
        'X-Auth-Email': CLOUDFLARE_EMAIL,
        'X-Auth-Key': CLOUDFLARE_GLOBAL_API_KEY,
        'Content-Type': 'application/json',
      },
    })
    return response?.data?.result
  } catch (error) {
    console.error(
      '❌ Ошибка запроса "getDNSRecords": ',
      error.response ? error.response.data : error.message,
    )
    throw error
  }
}

export const getZones = async (domain) => {
  // return null
  try {
    const response = await axios.get(CLOUDFLARE_ZONES_URL, {
      headers: {
        'X-Auth-Email': CLOUDFLARE_EMAIL,
        'X-Auth-Key': CLOUDFLARE_GLOBAL_API_KEY,
        'Content-Type': 'application/json',
      },
      params: {
        name: domain,
      },
    })
    return response?.data?.result
  } catch (error) {
    console.error(
      '❌ Ошибка запроса "getZones": ',
      error.response ? error.response.data : error.message,
    )
    throw error
  }
}

export const getDNSRecordsByDomain = async (domain) => {
  try {
    const zonesByDomain = await getZones(domain)
    if (!Array.isArray(zonesByDomain) || !zonesByDomain.length) {
      console.error('NOT Zones ', zonesByDomain)
      return []
    } else {
      const filterZones = zonesByDomain.filter((zone) => zone?.name === domain)
      const zoneId = getValidateString(filterZones[0]?.id)
      if (zoneId.trim()) {
        const dnsRecords = await getDNSRecords(zoneId)
        return getValidateArray(dnsRecords)
      } else {
        console.error('NOT zoneId ', zoneId)
      }
    }
  } catch (error) {
    console.error('❌ Ошибка запроса:', error.response ? error.response.data : error.message)
    return []
  }
}

export const getDataRecordsAndDomain = async (domains) => {
  const result = []
  for (const domain of getValidateArray(domains)) {
    try {
      const formattedDomain = getValidateString(domain).trim()
      if (formattedDomain) {
        const records = await getDNSRecordsByDomain(domain)
        if (records) {
          result.push({
            [NAME_KEY]: formattedDomain,
            [RECORDS_KEY]: records,
          })
        }
      }
    } catch (error) {
      console.error(
        '❌ Ошибка запроса: "getAllDNSRecords": ',
        error.response ? error.response.data : error.message,
      )
    }
  }
  return result
}

export const getDataRecordsAndDomainByMonth = async (domainsData) => {
  const result = []

  for (const [index, data] of getValidateArray(domainsData).entries()) {
    const domain = getValidateString(data?.[NAME_KEY]).trim()
    console.log(index + ' ' + domain)
    const date = getValidateString(data?.[DATE_KEY]).trim()
    const autoRenew = getValidateBoolean(data?.[AUTO_RENEW_KEY])
    const login = getValidateString(data?.[LOGIN_KEY]).trim()
    let records = []
    const resultObject = {
      [NAME_KEY]: domain,
      [RECORDS_KEY]: records,
      [DATE_KEY]: date,
      [AUTO_RENEW_KEY]: autoRenew,
      [LOGIN_KEY]: login,
    }
    try {
      if (domain) {
        records = await getDNSRecordsByDomain(domain)
        resultObject[RECORDS_KEY] = getValidateArray(records)
      }
    } catch (error) {
      console.error(
        '❌ Ошибка запроса: "getDataRecordsAndDomainByMonth": ',
        error.response ? error.response.data : error.message,
      )
    } finally {
      result.push({ ...resultObject })
    }
  }
  return result
}
