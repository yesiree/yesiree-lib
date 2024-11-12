import { v4 } from '@std/uuid'

export const createPid = (uuid = v4.generate()) => {
  let hex = uuid.replace(/-/g, '')
  if (hex.length % 2) hex = '0' + hex
  return BigInt('0x' + hex).toString(36).padStart(25, '0')
}

export const convertPidToUuid = (pid) => {
  const hex = BigInt(pid, 36).toString(16).padStart(32, '0')
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20)
  ].join('-')
}
