import { getValidateArray, getValidateBoolean, getValidateString } from './validate.js'
import {
  IP_KEY,
  DOMAIN_KEY,
  RECORDS_KEY,
  NAME_KEY,
  TYPE_KEY,
  PROXIED_KEY,
  CONTENT_KEY,
} from './constants.js'

export const getFilteredDNSRecordsByDomain = (allDataByRecords) => {
  return getValidateArray(allDataByRecords)
    .map((item) => {
      const domainName = getValidateString(item?.[NAME_KEY])
      const filteredRecords = getValidateArray(item?.[RECORDS_KEY])
        .filter(
          (domainData) =>
            getValidateString(domainData?.name).includes(domainName) &&
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
        name: domainName,
        records: filteredRecords,
      }
    })
    .filter((item) => item?.[RECORDS_KEY]?.length)
}
