/**
 * Creates an ID as unique as a UUID but shorter.
 * @param uuid - A UUID string (optional).
 * @returns A 25-character string.
 */
export const createPid = (uuid: string = crypto.randomUUID()): string => {
  let hex = uuid.replace(/-/g, '')
  if (hex.length % 2) hex = '0' + hex
  return BigInt('0x' + hex).toString(36).padStart(25, '0')
}
