import { getIdVerification, getDataRecordsAndDomainByMonth } from './api/api-cloud.js'

import { getFilteredDNSRecordsByDomain } from './assets/filtered-domains.js'
import { setCsvWriterDomainByMonth } from './csv-xlsx-file-read-write/csv-writer-result.js'
import { startXlsxReaderAllNamecheap } from './csv-xlsx-file-read-write/xlsx-reader-namecheap-all.js'
import { getFilteredDataByDate, getFromToSelectedDates } from './assets/date.js'
import { FROM_KEY, TO_KEY } from './constants/index.js'
import { setCsvWriterNamecheapDomainsByMonth } from './csv-xlsx-file-read-write/csv-writer-by-month.js'
import { startXlsxReaderOnlyServers } from './csv-xlsx-file-read-write/xlsx-reader-only-servers.js'

const getXLSXDataByMonth = async () => {
  //Получил данные про сервер с XLSX
  const allDataFromXLSXServers = startXlsxReaderOnlyServers()
  //Получил данные про Namecheap domains с XLSX
  const allDataFromXLSXNamecheap = startXlsxReaderAllNamecheap()
  //Получил дату (.env) с и по которой нужно отфтльтровать Namecheap domains
  const dates = getFromToSelectedDates()
  //Если нет даты с и по в (.env) - заканчиваем
  if (!dates) return null
  //Отфильтрованые домены с XLSX таблице по дате
  const filteredNamecheapByDates = getFilteredDataByDate(
    allDataFromXLSXNamecheap,
    dates?.[FROM_KEY],
    dates?.[TO_KEY],
  )
  //На всякий создаем XLSX таблицу с отфильтрованой и отсортированой датой
  setCsvWriterNamecheapDomainsByMonth(filteredNamecheapByDates)
  //На всякий чекним верификацию на клауд что бы проверить токены
  try {
    const response = await getIdVerification()
    console.log('response verify ', response)
  } catch (error) {
    console.error('Ошибка запроса на клауд. Проверить все токены', error)
    return null
  }
  //Запрос на все домены
  const dataByDomains = await getDataRecordsAndDomainByMonth(
    filteredNamecheapByDates.slice(
      filteredNamecheapByDates.length - 10,
      filteredNamecheapByDates.length - 1,
    ),
  )
  //Фильтруем по records
  const dataDomains = getFilteredDNSRecordsByDomain(dataByDomains)
  //Записываем в таблицу
  setCsvWriterDomainByMonth(dataDomains, allDataFromXLSXServers)
  //Готово
}

const start = performance.now()
getXLSXDataByMonth().finally(() => {
  const end = performance.now()
  console.log(`Функция выполнилась за ${(end - start) / 1000} с`)
})
