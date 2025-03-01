export const getValidateNumber = (value) => {
  if (typeof value !== 'number' && typeof value !== 'string') return 0
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  const formattedValue = parseFloat(value)

  return Number.isFinite(formattedValue) ? formattedValue : 0
}

export const getValidateString = (value) => {
  if (typeof value !== 'string') return ''
  return value
}

export const getValidateBoolean = (value) => {
  if (typeof value !== 'boolean') return false
  return value
}

export const getValidateArray = (data) => {
  if (!Array.isArray(data)) return []
  return data
}

export const getValidateObject = (data) => {
  if (
    !data ||
    typeof data !== 'object' ||
    Array.isArray(data) ||
    Object.prototype.toString.call(data) !== '[object Object]'
  ) {
    return {}
  }

  return data
}
