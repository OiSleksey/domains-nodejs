import XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  getValidateArray,
  getValidateBoolean,
  getValidateNumber,
  getValidateString,
} from '../assets/validate.js'
import {
  IP_KEY,
  XLSX_NAME_KEY,
  XLSX_DATE_EXPIRE_KEY,
  XLSX_IP_KEY,
  XLSX_AUTO_RENEW_KEY,
  XLSX_LOGIN_KEY,
  DATE_KEY,
  NAME_KEY,
  AUTO_RENEW_KEY,
  LOGIN_KEY,
  XLSX_NAME_APP_LIST_KEY,
  XLSX_SERVERS_ACTIVE_KEY,
  XLSX_CYRILLIC_ACTIVE_KEY,
  XLSX_CYRILLIC_DELETED_KEY,
  XLSX_NAME_MAIN_LIST_KEY,
  XLSX_SERVERS_NAME_KEY,
  XLSX_SERVERS_IP_KEY,
  XLSX_SERVERS_DEPARTMENT_KEY,
} from '../constants/index.js'

// Получаем __dirname в ES-модулях
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const inputDir = path.resolve(__dirname, '../xlsx-servers')

// Путь к файлу .xlsx
const filePath = path.resolve(__dirname, 'ваш_файл.xlsx')

const findXlsxFile = (dir) => {
  const files = fs.readdirSync(dir) // Читаем все файлы в директории
  const xlsxFile = files.find((file) => path.extname(file).toLowerCase() === '.xlsx') // Ищем .xlsx файл

  if (!xlsxFile) {
    throw new Error('Файл .xlsx не найден в текущей директории.')
  }

  return path.resolve(dir, xlsxFile) // Возвращаем полный путь к файлу
}

// Функция для чтения .xlsx файла и распределения данных по листам
const readXlsxFile = (filePath) => {
  try {
    // Читаем файл
    const fileBuffer = fs.readFileSync(filePath)

    // Парсим файл
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' })

    // Получаем список всех листов
    const sheetNames = workbook.SheetNames

    // Создаем объект для хранения данных из каждого листа
    const sheetsData = {}

    // Проходим по каждому листу
    sheetNames.forEach((sheetName) => {
      // Получаем данные из листа
      const sheet = workbook.Sheets[sheetName]

      // Преобразуем данные в JSON (массив объектов)
      const data = XLSX.utils.sheet_to_json(sheet)

      // Сохраняем данные в объект
      sheetsData[sheetName] = data
    })

    return sheetsData
  } catch (error) {
    console.error('Ошибка при чтении файла:', error)
    return null
  }
}

// Пример использования
const getFormattedServers = (data) => {
  return getValidateArray(data)
    .map((item) => {
      const nameServer = getValidateString(item?.[XLSX_SERVERS_NAME_KEY])
      const ip = getValidateString(item?.[XLSX_SERVERS_IP_KEY])
      const active = getValidateString(item?.[XLSX_SERVERS_ACTIVE_KEY])
      const isActive = active !== XLSX_CYRILLIC_DELETED_KEY
      const department = getValidateString(item?.[XLSX_SERVERS_DEPARTMENT_KEY])

      if (!ip || !active || !nameServer) return null
      return {
        [XLSX_SERVERS_NAME_KEY]: nameServer,
        [XLSX_SERVERS_ACTIVE_KEY]: isActive,
        [XLSX_SERVERS_IP_KEY]: ip,
        [XLSX_SERVERS_DEPARTMENT_KEY]: department,
      }
    })
    .filter((item) => item)
}
// Основная функция
export const startXlsxReaderOnlyServers = () => {
  try {
    const xlsxFilePath = findXlsxFile(inputDir)
    const sheetsData = readXlsxFile(xlsxFilePath)

    // console.log(sheetsData)

    if (sheetsData) {
      const mainServers = getFormattedServers(sheetsData?.[XLSX_NAME_MAIN_LIST_KEY])
      const appServers = getFormattedServers(sheetsData?.[XLSX_NAME_APP_LIST_KEY])
      return [...mainServers, ...appServers]
    } else {
      console.error('Error data by "sheetsData" in "startXlsxReaderOnlyServers"')
      return []
    }
  } catch (error) {
    // console.error('ERROR "startXlsxReader": ', error.message)
    return []
  }
}
