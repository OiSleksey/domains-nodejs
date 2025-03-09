import moment from 'moment'
import dotenv from 'dotenv'
import { getValidateArray, getValidateString } from './validate.js'
import { DATE_KEY, FROM_KEY, TO_KEY, FORMAT_TIME } from '../constants/index.js'

dotenv.config()

const SELECTED_MONTH = process.env.SELECTED_MONTH
const SELECTED_YEAR = process.env.SELECTED_YEAR

export const getFromToSelectedDates = () => {
  const month = getValidateString(SELECTED_MONTH).trim()
  const year = getValidateString(SELECTED_YEAR).trim()
  if (!month || !year) {
    console.error(
      'Error in "getFromToSelectedDates": Select "SELECTED_MONTH" and "SELECTED_YEAR" in .env file',
    )
    return null
  }
  const selectedDate = moment(`${year}-${month}`, 'YYYY-MM')
  const fromSelectDate = selectedDate.startOf('month').format('YYYY-MM-DD')
  const toSelectDate = selectedDate.endOf('month').format('YYYY-MM-DD')
  const from = selectedDate.clone().subtract(1, 'month').endOf('month').format('YYYY-MM-DD')
  const to = selectedDate.clone().add(1, 'month').startOf('month').format('YYYY-MM-DD')

  return {
    fromSelectDate,
    toSelectDate,
    [FROM_KEY]: from,
    [TO_KEY]: to,
  }
}

export const excelDateToJSDate = (excelDate) => {
  const jsDate = moment('1899-12-30').add(excelDate, 'days')
  return jsDate.format(FORMAT_TIME)
}

export const sortByDate = (data) => {
  const formattedData = getValidateArray(data)
  const copyData = JSON.parse(JSON.stringify(formattedData))
  return copyData.sort((a, b) => {
    const aSeconds = moment(a?.[DATE_KEY], FORMAT_TIME).valueOf()
    const bSeconds = moment(b?.[DATE_KEY], FORMAT_TIME).valueOf()
    return aSeconds - bSeconds
  })
}

export const getFilteredDataByDate = (data, from, to) => {
  if (!data || !from || !to) {
    console.error(
      'Error in "getFilteredDataByDate": No data in attributes "data" || "from" || "to" ',
    )
    return null
  }

  const fromDate = moment(from, FORMAT_TIME)
  const toDate = moment(to, FORMAT_TIME)

  return getValidateArray(data).filter((item) => {
    const itemDate = moment(item?.[DATE_KEY], FORMAT_TIME)
    return itemDate.isSameOrAfter(fromDate, 'day') && itemDate.isSameOrBefore(toDate, 'day')
  })
}

export const delayMS = async (ms) => {
  if (!ms) return new Promise((resolve) => resolve)
  return new Promise((resolve) => setTimeout(resolve, ms))
}
