import { getDataRecordsAndDomain } from './requests.js'

import { getFilteredDNSRecordsByDomain } from './filtered-domains.js'
import { domains } from './domains.js'
import { setCsvWriter } from './csv-writer.js'

const setDataInCsvFile = async (domains) => {
  const dataByDomains = await getDataRecordsAndDomain(domains)
  const dataDomains = getFilteredDNSRecordsByDomain(dataByDomains)
  setCsvWriter(dataDomains)
}

setDataInCsvFile(domains)
