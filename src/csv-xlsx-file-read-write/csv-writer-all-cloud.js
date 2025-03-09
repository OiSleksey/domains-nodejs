import { createObjectCsvWriter as createCsvWriter } from 'csv-writer'
import path from 'path'
import { fileURLToPath } from 'url'
import { getValidateArray, getValidateBoolean, getValidateString } from '../assets/validate.js'
import {
  IP_KEY,
  DOMAIN_KEY,
  RECORDS_KEY,
  NAME_KEY,
  TYPE_KEY,
  PROXIED_KEY,
  DATE_KEY,
  XLSX_SERVERS_NAME_KEY,
  AUTO_RENEW_KEY,
  LOGIN_KEY,
  XLSX_TITLE_NAME_KEY,
  XLSX_TITLE_DATE_KEY,
  XLSX_TITLE_IP_KEY,
  XLSX_TITLE_SERVER_KEY,
  XLSX_TITLE_AUTO_RENEW_KEY,
  XLSX_TITLE_LOGIN_KEY,
  XLSX_TITLE_DEPARTMENT_KEY,
  XLSX_SERVERS_DEPARTMENT_KEY,
  XLSX_SERVERS_ACTIVE_KEY,
  ZONE_ID_KEY,
  STATUS_CLOUD_KEY,
  XLSX_TITLE_STATUS_CLOUD_KEY,
  XLSX_TITLE_ZONE_ID_KEY,
} from '../constants/index.js'

// Получаем __dirname в ES-модулях
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const outputDir = path.resolve(__dirname, '../output-csv')

const getServerAndDepartmentData = (records, serversArray) => {
  let displayServerName = ''
  let displayDepartment = ''

  getValidateArray(records).forEach((record, index, array) => {
    const ip = getValidateString(record?.[IP_KEY]).trim()
    const findIndex = getValidateArray(serversArray).findIndex(
      (item) => getValidateString(item?.[IP_KEY]).trim() === ip,
    )
    const isLastItem = array?.length === index + 1
    if (findIndex !== -1) {
      const isActive = getValidateBoolean(serversArray?.[findIndex]?.[XLSX_SERVERS_ACTIVE_KEY])
        ? ''
        : 'DEL'
      const serverName = getValidateString(
        serversArray?.[findIndex]?.[XLSX_SERVERS_NAME_KEY],
      ).trim()
      const department = getValidateString(
        serversArray?.[findIndex]?.[XLSX_SERVERS_DEPARTMENT_KEY],
      ).trim()
      if (isLastItem) {
        displayServerName = displayServerName + `${isActive} ${ip} - ${serverName}`
        displayDepartment = displayDepartment + `${department}`
      } else {
        displayServerName = displayServerName + `${isActive} ${ip} - ${serverName} | `
        displayDepartment = displayDepartment + `${department} | `
      }
    }
  })
  return {
    displayServerName,
    displayDepartment,
  }
}

const getDisplayIps = (records, domain) => {
  const arrayRecords = getValidateArray(records)
  let displayIps = ''
  if (arrayRecords.length) {
    arrayRecords.forEach((record, index, array) => {
      const type = getValidateString(record?.[TYPE_KEY]).trim()
      const ip = getValidateString(record?.[IP_KEY]).trim()
      const name =
        getValidateString(record?.[NAME_KEY]).trim() === domain
          ? ''
          : getValidateString(record?.[NAME_KEY]).trim()
      const proxied = getValidateBoolean(record?.[PROXIED_KEY]) ? 'PROXIED' : 'DNS ONLY'
      const isLastItem = array?.length === index + 1
      if (isLastItem) {
        if (name) {
          displayIps = displayIps + ` ${type} ${name} ${ip} ${proxied}`
        } else {
          displayIps = displayIps + ` ${type} ${ip} ${proxied}`
        }
      } else {
        if (name) {
          displayIps = displayIps + `${type} ${name} ${ip} ${proxied} | `
        } else {
          displayIps = displayIps + `${type} ${ip} ${proxied} | `
        }
      }
    })
  } else {
    displayIps = 'NOT FOUND IN CLOUD'
  }
  return displayIps
}

const getDisplayAutoRenew = (data) => {
  if (typeof data === 'boolean') return data ? 'TRUE' : 'FALSE'
  return 'NO DATA'
}

const getFindString = (name) => {
  return getValidateString(name).trim().toLowerCase()
}
const getDataFromNamecheap = (namecheapData, name) => {
  const result = {
    [NAME_KEY]: name,
    [DATE_KEY]: '',
    [AUTO_RENEW_KEY]: '',
    [LOGIN_KEY]: '',
  }
  const arrayNamecheap = getValidateArray(namecheapData)
  const findIndex = arrayNamecheap.findIndex(
    (item) => getFindString(item?.[NAME_KEY]) === getFindString(name),
  )
  if (findIndex !== -1) {
    result[DATE_KEY] = getValidateString(arrayNamecheap[findIndex]?.[DATE_KEY])
    result[AUTO_RENEW_KEY] = getDisplayAutoRenew(arrayNamecheap[findIndex]?.[AUTO_RENEW_KEY])
    result[LOGIN_KEY] = getValidateString(arrayNamecheap[findIndex]?.[LOGIN_KEY])
  }
  return result
}

const getCVSData = (allCloudData, allServers, allNamecheapData) => {
  const result = []

  getValidateArray(allCloudData).forEach((item) => {
    const name = getFindString(item?.[NAME_KEY])
    const zoneId = getFindString(item?.[ZONE_ID_KEY])
    const status = getFindString(item?.[STATUS_CLOUD_KEY])
    const records = getValidateArray(item?.[RECORDS_KEY])
    const { date, autoRenew, login } = getDataFromNamecheap(allNamecheapData, name)
    const displayIps = getDisplayIps(records, name)
    const { displayServerName, displayDepartment } = getServerAndDepartmentData(records, allServers)

    const resultData = {
      [DOMAIN_KEY]: name,
      [ZONE_ID_KEY]: zoneId,
      [STATUS_CLOUD_KEY]: status,
      [DATE_KEY]: date,
      [IP_KEY]: displayIps,
      [XLSX_SERVERS_NAME_KEY]: displayServerName || ':-)',
      [AUTO_RENEW_KEY]: autoRenew,
      [LOGIN_KEY]: login,
      [XLSX_SERVERS_DEPARTMENT_KEY]: displayDepartment,
    }
    result.push({ ...resultData })
  })

  return result
}

const createCsvFile = () => {
  return createCsvWriter({
    path: path.resolve(outputDir, 'cloud-all-data.csv'),
    header: [
      { id: DOMAIN_KEY, title: XLSX_TITLE_NAME_KEY },
      { id: ZONE_ID_KEY, title: XLSX_TITLE_ZONE_ID_KEY },
      { id: STATUS_CLOUD_KEY, title: XLSX_TITLE_STATUS_CLOUD_KEY },
      { id: DATE_KEY, title: XLSX_TITLE_DATE_KEY },
      { id: IP_KEY, title: XLSX_TITLE_IP_KEY },
      { id: XLSX_SERVERS_NAME_KEY, title: XLSX_TITLE_SERVER_KEY },
      { id: AUTO_RENEW_KEY, title: XLSX_TITLE_AUTO_RENEW_KEY },
      { id: LOGIN_KEY, title: XLSX_TITLE_LOGIN_KEY },
      { id: XLSX_SERVERS_DEPARTMENT_KEY, title: XLSX_TITLE_DEPARTMENT_KEY },
    ],
    fieldDelimiter: ';',
  })
}

// Запись данных в CSV
export const setCsvWriterAllDataCloud = (allCloudData, allServers, allNamecheapData) => {
  const dataByWrite = getCVSData(allCloudData, allServers, allNamecheapData)
  const csvWriter = createCsvFile()

  csvWriter
    .writeRecords(dataByWrite)
    .then(() => {
      console.log('CSV файл "cloud-all-data.csv" успешно создан!')
    })
    .catch((err) => {
      console.error('Ошибка при создании CSV файла "cloud-all-data.csv":', err)
    })
}
