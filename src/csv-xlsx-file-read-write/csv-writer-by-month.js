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
  AUTO_RENEW_KEY,
  LOGIN_KEY,
} from '../constants/index.js'

// Получаем __dirname в ES-модулях
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const outputDir = path.resolve(__dirname, '../output-csv')

const getCVSData = (data) => {
  return getValidateArray(data).map((item) => {
    return {
      [NAME_KEY]: getValidateString(item?.[NAME_KEY]),
      [DATE_KEY]: getValidateString(item?.[DATE_KEY]),
      [IP_KEY]: getValidateString(item?.[IP_KEY]),
      [AUTO_RENEW_KEY]: getValidateBoolean(item?.[AUTO_RENEW_KEY]),
      [LOGIN_KEY]: getValidateString(item?.[LOGIN_KEY]),
    }
  })
}

const createCsvFile = () => {
  return createCsvWriter({
    path: path.resolve(outputDir, 'namecheap-domains-by-month.csv'), // Путь к файлу
    header: [
      { id: NAME_KEY, title: NAME_KEY },
      { id: DATE_KEY, title: DATE_KEY },
      { id: IP_KEY, title: IP_KEY },
      { id: AUTO_RENEW_KEY, title: AUTO_RENEW_KEY },
      { id: LOGIN_KEY, title: LOGIN_KEY },
    ],
    fieldDelimiter: ';', // Разделитель колонок (запятая)
  })
}

// Запись данных в CSV
export const setCsvWriterNamecheapDomainsByMonth = (domainsData) => {
  const dataByWrite = getCVSData(domainsData)
  const csvWriter = createCsvFile()

  csvWriter
    .writeRecords(dataByWrite)
    .then(() => {
      console.log('CSV файл "namecheap-domains-by-month.csv" успешно создан!')
    })
    .catch((err) => {
      console.error('Ошибка при создании CSV файла "namecheap-domains-by-month.csv":', err)
    })
}
