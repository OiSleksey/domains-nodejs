import axios from 'axios'
import dotenv from 'dotenv'
import {
  getValidateArray,
  getValidateBoolean,
  getValidateNumber,
  getValidateString,
} from '../assets/validate.js'
import {
  AUTO_RENEW_KEY,
  DATE_KEY,
  DOMAIN_KEY,
  LOGIN_KEY,
  NAME_KEY,
  RECORDS_KEY,
  STATUS_CLOUD_KEY,
  ZONE_ID_KEY,
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

export const getZonesByDomain = async (domain) => {
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
      '❌ Ошибка запроса "getZonesByDomain": ',
      error.response ? error.response.data : error.message,
    )
    throw error
  }
}

export const getTotalCountByZones = async () => {
  // return null
  try {
    const response = await axios.get(CLOUDFLARE_ZONES_URL, {
      headers: {
        'X-Auth-Email': CLOUDFLARE_EMAIL,
        'X-Auth-Key': CLOUDFLARE_GLOBAL_API_KEY,
        'Content-Type': 'application/json',
      },
    })
    return response?.data?.result_info?.total_count
  } catch (error) {
    console.error(
      '❌ Ошибка запроса "getTotalCountByZones": ',
      error.response ? error.response.data : error.message,
    )
    throw error
  }
}

export const getDNSRecordsByDomain = async (domain) => {
  try {
    const zonesByDomain = await getZonesByDomain(domain)
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
  if (!Array.isArray(domains) || !domains.length) {
    console.error('NOT domains "getDataRecordsAndDomain":', domains)
    return []
  }

  for (const [index, domain] of getValidateArray(domains).entries()) {
    console.log(index + ' ' + domain)
    try {
      const formattedDomain = getValidateString(domain).trim()
      if (formattedDomain) {
        const records = await getDNSRecordsByDomain(formattedDomain)
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

export const getCountPagesByZones = async (countPerPage) => {
  const totalPages = getValidateNumber(await getTotalCountByZones())
  if (!totalPages) return 0
  const countPages = Math.ceil(totalPages / countPerPage)
  return countPages || 0
}

export const getZonesByPage = async (page, perPage) => {
  // return null
  try {
    const response = await axios.get(CLOUDFLARE_ZONES_URL, {
      headers: {
        'X-Auth-Email': CLOUDFLARE_EMAIL,
        'X-Auth-Key': CLOUDFLARE_GLOBAL_API_KEY,
        'Content-Type': 'application/json',
      },
      params: {
        page: page,
        per_page: perPage,
      },
    })
    return response?.data?.result
  } catch (error) {
    console.error(
      '❌ Ошибка запроса "getZonesByDomain": ',
      error.response ? error.response.data : error.message,
    )
    throw error
  }
}

export const getDNSRecordsByData = async (domainData) => {
  const zoneId = getValidateString(domainData?.[ZONE_ID_KEY])
  const domain = getValidateString(domainData?.[NAME_KEY])
  const status = getValidateString(domainData?.[STATUS_CLOUD_KEY])
  const result = {
    [ZONE_ID_KEY]: zoneId,
    [NAME_KEY]: domain,
    [STATUS_CLOUD_KEY]: status,
    [RECORDS_KEY]: [],
  }
  if (!zoneId || !domain) {
    console.error('NOT zoneId | domain in "getDNSRecordsByData" ')
    return result
  }
  try {
    const dnsRecords = await getDNSRecords(zoneId)
    result[RECORDS_KEY] = getValidateArray(dnsRecords)
    return result
  } catch (error) {
    console.error(
      '❌ Ошибка запроса "getDNSRecordsByData":',
      error.response ? error.response.data : error.message,
    )
    return result
  }
}
