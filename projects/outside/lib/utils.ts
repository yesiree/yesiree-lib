export type ColorFn = (message: string) => string
export const identity = <T>(value: T): T => value
export const getTimestamp = (): string => {
  const date = new Date()
  const YYYY = date.getFullYear()
  const MM = ('0' + (date.getMonth() + 1)).slice(-2)
  const DD = ('0' + date.getDate()).slice(-2)
  const HH = ('0' + date.getHours()).slice(-2)
  const mm = ('0' + date.getMinutes()).slice(-2)
  const ss = ('0' + date.getSeconds()).slice(-2)
  return `${YYYY}-${MM}-${DD} ${HH}:${mm}:${ss}`
}
