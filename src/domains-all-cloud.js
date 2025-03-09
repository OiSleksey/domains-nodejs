import {
  getDataRecordsAndDomain,
  getTotalCountByZones,
  getZonesByPage,
  getCountPagesByZones,
  getDNSRecordsByData,
} from './api/api-cloud.js'

import {
  getFilteredDataFromCloud,
  getFilteredDNSRecordsByDomain,
} from './assets/filtered-domains.js'
import { completedFilteredDataFromCloudExample, domains } from './input-data/domains.js'
import { setCsvWriterDomainByMonth } from './csv-xlsx-file-read-write/csv-writer-result.js'
import { startXlsxReaderOnlyServers } from './csv-xlsx-file-read-write/xlsx-reader-only-servers.js'
import { getValidateArray, getValidateNumber } from './assets/validate.js'
import { startXlsxReaderAllNamecheap } from './csv-xlsx-file-read-write/xlsx-reader-namecheap-all.js'
import { delayMS } from './assets/date.js'
import { setCsvWriterCloudDomainsZones } from './csv-xlsx-file-read-write/csv-writer-all-zone-name-cloud.js'
import { setCsvWriterAllDataCloud } from './csv-xlsx-file-read-write/csv-writer-all-cloud.js'

// const setDataInCsvFile = async (domains) => {
//   const allDataFromXLSXServers = startXlsxReaderOnlyServers()
//   const dataByDomains = await getDataRecordsAndDomain(domains)
//   const dataDomains = getFilteredDNSRecordsByDomain(dataByDomains)
//   setCsvWriterDomainByMonth(dataDomains, allDataFromXLSXServers)
// }
//
// const start = performance.now()
// setDataInCsvFile(domains).finally(() => {
//   const end = performance.now()
//   console.log(`Функция выполнилась за ${(end - start) / 1000} с`)
// })

const COUNT_PER_PAGE = 100
const COUNT_REQUEST_BY_TIME = 1000
// const COUNT_REQUEST_BY_TIME = 100
//Задержка в 7 минут
const DELAY_TIME_CLOUD = 420000
// const DELAY_TIME_CLOUD = 2000

const getAllZonesNamesFromCloud = async () => {
  const result = []
  const countPages = await getCountPagesByZones(COUNT_PER_PAGE)

  const promises = []
  for (let i = 0; i < countPages; i++) {
    const page = i + 1
    promises.push(getZonesByPage(page, COUNT_PER_PAGE))
  }

  // promises.push(getZonesByPage(1, COUNT_PER_PAGE))
  // promises.push(getZonesByPage(2, COUNT_PER_PAGE))
  // promises.push(getZonesByPage(3, COUNT_PER_PAGE))

  const responses = getValidateArray(await Promise.all(promises))

  responses.forEach((pageResult) => {
    result.push(...pageResult)
  })
  return getFilteredDataFromCloud(result)
}

const getAllDnsRecordsByZones = async (allDomainAndZones) => {
  const arrayAllDomainAndZones = getValidateArray(allDomainAndZones)
  const totalCount = arrayAllDomainAndZones.length
  const countRequests = Math.ceil(totalCount / COUNT_REQUEST_BY_TIME)
  const result = []

  for (let i = 0; i < countRequests; i++) {
    const promises = []
    const firstIndex = i * COUNT_REQUEST_BY_TIME
    const lastIndex = (i + 1) * COUNT_REQUEST_BY_TIME

    const currentRequestData = arrayAllDomainAndZones.slice(firstIndex, lastIndex)
    for (const domainData of currentRequestData) {
      promises.push(getDNSRecordsByData(domainData))
    }

    const responses = getValidateArray(await Promise.all(promises))

    responses.forEach((promiseResult) => {
      result.push({ ...promiseResult })
    })

    console.log('DELAY lastIndex ', lastIndex)
    await delayMS(DELAY_TIME_CLOUD)
  }

  return result
}

const startScript = async () => {
  //Получил данные про сервер с XLSX
  const allDataFromXLSXServers = startXlsxReaderOnlyServers()
  //Получил данные про Namecheap domains с XLSX
  const allDataFromXLSXNamecheap = startXlsxReaderAllNamecheap()
  // console.log(allDataFromXLSXServers[0])
  // console.log(allDataFromXLSXNamecheap[0])
  const allZonesNamesFromCloud = await getAllZonesNamesFromCloud()
  //Записываю на всякий все домены в таблицу
  setCsvWriterCloudDomainsZones(allZonesNamesFromCloud)
  console.log('start Delay')
  await delayMS(DELAY_TIME_CLOUD)
  console.log('stop Delay')
  const allDataDomainByZonesRecords = await getAllDnsRecordsByZones(allZonesNamesFromCloud)
  const filteredDomainsDataByRecords = getFilteredDNSRecordsByDomain(allDataDomainByZonesRecords)
  console.log('============================================================')

  setCsvWriterAllDataCloud(
    filteredDomainsDataByRecords,
    allDataFromXLSXServers,
    allDataFromXLSXNamecheap,
  )
}

const start = performance.now()
startScript().finally(() => {
  const end = performance.now()
  console.log(`Функция выполнилась за ${(end - start) / 1000} с`)
})
