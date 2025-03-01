import { createObjectCsvWriter as createCsvWriter } from 'csv-writer'
import path from 'path'
import { fileURLToPath } from 'url'
import { getValidateArray, getValidateBoolean, getValidateString } from './validate.js'
import { IP_KEY, DOMAIN_KEY, RECORDS_KEY, NAME_KEY, TYPE_KEY, PROXIED_KEY } from './constants.js'

// Получаем __dirname в ES-модулях
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const getCVSData = (data) => {
  const result = []

  getValidateArray(data).forEach((item) => {
    const domain = getValidateString(item?.name)
    let displayIp = ''

    getValidateArray(item.records).forEach((record, index, array) => {
      const type = getValidateString(record?.[TYPE_KEY])
      const ip = getValidateString(record?.[IP_KEY])
      const name =
        getValidateString(record?.[NAME_KEY]) === domain ? '' : getValidateString(record?.name)
      const proxied = getValidateBoolean(record?.[PROXIED_KEY]) ? 'TRUE' : 'FALSE'
      const isLastItem = array?.length === index + 1
      if (isLastItem) {
        if (name) {
          displayIp = displayIp + ` ${type} ${name} ${ip} ${proxied}`
        } else {
          displayIp = displayIp + ` ${type} ${ip} ${proxied}`
        }
      } else {
        if (name) {
          displayIp = displayIp + `${type} ${name} ${ip} ${proxied} | `
        } else {
          displayIp = displayIp + `${type} ${ip} ${proxied} | `
        }
      }
    })
    result.push({ [DOMAIN_KEY]: domain, [IP_KEY]: displayIp })
  })
  return result
}

const createCsvFile = () => {
  return createCsvWriter({
    path: path.resolve(__dirname, 'output.csv'), // Путь к файлу
    header: [
      { id: DOMAIN_KEY, title: DOMAIN_KEY }, // Заголовок для колонки "domain"
      { id: IP_KEY, title: IP_KEY }, // Заголовок для колонки "ip"
    ],
    fieldDelimiter: ';', // Разделитель колонок (запятая)
  })
}

// Запись данных в CSV
export const setCsvWriter = (domainsData) => {
  const dataByWrite = getCVSData(domainsData)
  const csvWriter = createCsvFile()

  csvWriter
    .writeRecords(dataByWrite)
    .then(() => {
      console.log('CSV файл успешно создан!')
    })
    .catch((err) => {
      console.error('Ошибка при создании CSV файла:', err)
    })
}
