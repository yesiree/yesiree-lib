const uuidv4 = require('uuid/v4')
const BigNumber = require('bignumber.js')

const UUID_BASE16 = 16
const PID_BASE36 = 36
const SYMBOLS = '0123456789abcdefghijklmnopqrstuvwxyz'
const RE_UUID_NO_HYPHEN = /^([a-f0-9]{8})([a-f0-9]{4})([a-f0-9]{4})([a-f0-9]{4})([a-f0-9]{12})$/
const RE_UUID_WITH_HYPHEN = '$1-$2-$3-$4-$5'

module.exports.create = (uuid = '') => {
  if (uuid === '') uuid = uuidv4()
  uuid = uuid.replace(/-/g, '').toLowerCase()
  let pid = baseToBase(uuid, UUID_BASE16, PID_BASE36)
  return '' + padStart(pid, 25, '0')
}

module.exports.toUuid = (pid) => {
  let uuid = baseToBase(pid, PID_BASE36, UUID_BASE16)
  uuid = padStart(uuid, 32, '0')
  return '' + uuid.replace(RE_UUID_NO_HYPHEN, RE_UUID_WITH_HYPHEN)
}

const padStart = (str, count, char) => {
  count = count - (str || '').length
  if (count <= 0) return str
  let pad = char
  while (count > pad.length) pad += char
  pad = pad.substr(0, count)
  return pad + str
}

const baseToBase = (digits, fromBase, toBase) => {
  return valueToForm(formToValue(digits, fromBase), toBase)
}

const valueToForm = (value, base) => {
  if (!(value instanceof BigNumber)) value = BigNumber(value)
  let digits = ''
  while (value.comparedTo(0) > 0) {
    const quotient = value.idiv(base)
    const remainder = value.mod(base)
    digits = SYMBOLS[remainder] + digits
    value = quotient
  }
  return digits
}

const formToValue = (digits, base) => {
  if (base > PID_BASE36) {
    throw new Error(`Base '${base}' exceeds maximum '${PID_BASE36}'.`)
  }
  const subset = SYMBOLS.substr(0, base)
  let value = BigNumber(0)
  for (let c of digits) {
    const index = subset.indexOf(c)
    if (index === -1) {
      throw new Error(`Invalid digit '${c}', not found in '${base}' digits '${subset}'.`)
    }
    value = value.times(base).plus(index)
  }
  return value
}
