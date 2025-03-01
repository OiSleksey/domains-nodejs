import axios from 'axios'
import dotenv from 'dotenv'
import { getValidateArray, getValidateString } from './validate.js'
import { NAME_KEY, RECORDS_KEY } from './constants.js'
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
  console.log(CLOUDFLARE_EMAIL)
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
      return null
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
    return null
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
