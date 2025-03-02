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
} from '../constants/index.js'
import { sortByDate } from '../assets/date.js'
import { excelDateToJSDate } from '../assets/date.js'
// Получаем __dirname в ES-модулях
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const inputDir = path.resolve(__dirname, '../input-data')

// Функция для поиска ближайшего .xlsx файла в текущей директории
const findXlsxFile = (dir) => {
  const files = fs.readdirSync(dir) // Читаем все файлы в директории
  const xlsxFile = files.find((file) => path.extname(file).toLowerCase() === '.xlsx') // Ищем .xlsx файл

  if (!xlsxFile) {
    throw new Error('Файл .xlsx не найден в текущей директории.')
  }

  return path.resolve(dir, xlsxFile) // Возвращаем полный путь к файлу
}

// Функция для чтения .xlsx файла и преобразования в массив данных
const readXlsxFile = (filePath) => {
  try {
    // Читаем файл
    const fileBuffer = fs.readFileSync(filePath)

    // Парсим файл
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' })

    // Получаем имя первого листа
    const sheetName = workbook.SheetNames[0]

    // Получаем данные из первого листа
    const sheet = workbook.Sheets[sheetName]

    // Преобразуем данные в JSON (массив объектов)
    const data = XLSX.utils.sheet_to_json(sheet)

    const formattedData = data.map((item) => {
      const date = getValidateNumber(item?.[XLSX_DATE_EXPIRE_KEY])
      const formattedDate = excelDateToJSDate(date)
      const name = getValidateString(item?.[XLSX_NAME_KEY])
      const ip = getValidateString(item?.[XLSX_IP_KEY])
      const autoRenew = getValidateBoolean(item?.[XLSX_AUTO_RENEW_KEY])
      const login = getValidateString(item?.[XLSX_LOGIN_KEY])
      return {
        [NAME_KEY]: name,
        [DATE_KEY]: formattedDate,
        [IP_KEY]: ip,
        [AUTO_RENEW_KEY]: autoRenew,
        [LOGIN_KEY]: login,
      }
    })
    // return formattedData
    return sortByDate(formattedData)
  } catch (error) {
    console.error('Ошибка при чтении файла "readXlsxFile":', error)
    return []
  }
}

// Основная функция
export const startXlsxReaderAllNamecheap = () => {
  try {
    // Находим ближайший .xlsx файл
    const xlsxFilePath = findXlsxFile(inputDir)

    // Читаем файл и преобразуем в массив данных
    const excelData = readXlsxFile(xlsxFilePath)

    return getValidateArray(excelData)
    // if (excelData) {
    //   // console.log('Данные из Excel:', excelData);
    //   const dataDomain = {
    //     name: 'assessmencer.store',
    //     date: '2025-04-01'
    //   }
    //   const findData = getValidateArray(excelData).find((item) => item?.[NAME_KEY] === dataDomain?.[NAME_KEY]);
    //   console.log(findData)
    // }
  } catch (error) {
    console.error('ERROR "startXlsxReader": ', error.message)
    return []
  }
}
