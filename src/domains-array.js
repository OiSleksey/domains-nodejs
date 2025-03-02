import { getDataRecordsAndDomain } from './api/api-cloud.js'

import { getFilteredDNSRecordsByDomain } from './assets/filtered-domains.js'
import { domains } from './input-data/domains.js'
import { setCsvWriterDomainByMonth } from './csv-xlsx-file-read-write/csv-writer-result.js'
import { startXlsxReaderOnlyServers } from './csv-xlsx-file-read-write/xlsx-reader-only-servers.js'

const setDataInCsvFile = async (domains) => {
  const allDataFromXLSXServers = startXlsxReaderOnlyServers()
  const dataByDomains = await getDataRecordsAndDomain(domains)
  const dataDomains = getFilteredDNSRecordsByDomain(dataByDomains)
  setCsvWriterDomainByMonth(dataDomains, allDataFromXLSXServers)
}

const start = performance.now()
setDataInCsvFile(domains).finally(() => {
  const end = performance.now()
  console.log(`Функция выполнилась за ${(end - start) / 1000} с`)
})
