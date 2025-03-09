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
  ZONE_ID_KEY,
  STATUS_CLOUD_KEY,
} from '../constants/index.js'

// Получаем __dirname в ES-модулях
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const outputDir = path.resolve(__dirname, '../output-csv')

const getCVSData = (data) => {
  return getValidateArray(data).map((item) => {
    return {
      [NAME_KEY]: getValidateString(item?.[NAME_KEY]),
      [ZONE_ID_KEY]: getValidateString(item?.[ZONE_ID_KEY]),
      [STATUS_CLOUD_KEY]: getValidateString(item?.[STATUS_CLOUD_KEY]),
    }
  })
}

const createCsvFile = () => {
  return createCsvWriter({
    path: path.resolve(outputDir, 'csv-writer-all-zone-name-cloud.csv'), // Путь к файлу
    header: [
      { id: NAME_KEY, title: NAME_KEY },
      { id: ZONE_ID_KEY, title: ZONE_ID_KEY },
      { id: STATUS_CLOUD_KEY, title: STATUS_CLOUD_KEY },
    ],
    fieldDelimiter: ';', // Разделитель колонок (запятая)
  })
}

// Запись данных в CSV
export const setCsvWriterCloudDomainsZones = (domainsData) => {
  const dataByWrite = getCVSData(domainsData)
  const csvWriter = createCsvFile()

  csvWriter
    .writeRecords(dataByWrite)
    .then(() => {
      console.log('CSV файл "csv-writer-all-zone-name-cloud.csv" успешно создан!')
    })
    .catch((err) => {
      console.error('Ошибка при создании CSV файла "csv-writer-all-zone-name-cloud.csv":', err)
    })
}
