import { getValidateArray, getValidateBoolean, getValidateString } from './validate.js'
import {
  IP_KEY,
  DOMAIN_KEY,
  RECORDS_KEY,
  NAME_KEY,
  TYPE_KEY,
  PROXIED_KEY,
  CONTENT_KEY,
  ID_CLOUD_KEY,
  NAME_CLOUD_KEY,
  STATUS_CLOUD_KEY,
} from '../constants/index.js'

export const getFilteredDNSRecordsByDomain = (allDataByRecords) => {
  return getValidateArray(allDataByRecords).map((item) => {
    const domainName = getValidateString(item?.[NAME_KEY])
    const filteredRecords = getValidateArray(item?.[RECORDS_KEY])
      .filter(
        (domainData) =>
          getValidateString(domainData?.[NAME_KEY]).includes(domainName) &&
          domainData?.[NAME_KEY] !== 'www.' + domainName,
      )
      .map((domainData) => {
        return {
          name: getValidateString(domainData?.[NAME_KEY]),
          type: getValidateString(domainData?.[TYPE_KEY]),
          ip: getValidateString(domainData?.[CONTENT_KEY]),
          proxied: getValidateBoolean(domainData?.[PROXIED_KEY]),
        }
      })

    return {
      ...item,
      [RECORDS_KEY]: filteredRecords,
    }
  })
  // .filter((item) => item?.[RECORDS_KEY]?.length)
}

export const getFilteredDataFromCloud = (allDataByRecords) => {
  return getValidateArray(allDataByRecords)
    .map((item) => {
      const name = getValidateString(item?.[NAME_CLOUD_KEY])
      const zoneId = getValidateString(item?.[ID_CLOUD_KEY])
      const status = getValidateString(item?.[STATUS_CLOUD_KEY])
      return {
        name: name,
        zoneId: zoneId,
        status: status,
      }
    })
    .filter((item) => item?.name && item?.zoneId)
}

export const getFilteredDomainsFromXLSXByData = (data, from, to) => {}
