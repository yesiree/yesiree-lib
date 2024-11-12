import { bold, gray, cyan, brightBlue, brightWhite, brightRed, brightGreen, brightYellow, brightMagenta, rgb24 } from '@std/fmt/colors'
import { getTimestamp, write, type ColorFn, type Writer } from './utils.ts'

const boldBrightBlue = (message: string) => bold(brightBlue(message))
const boldBrightWhite = (message: string) => bold(brightWhite(message))
const boldBrightRed = (message: string) => bold(brightRed(message))
const boldBrightGreen = (message: string) => bold(brightGreen(message))
const boldBrightYellow = (message: string) => bold(brightYellow(message))
const boldBrightMagenta = (message: string) => bold(brightMagenta(message))
const boldBrightOrange = (message: string) => bold(rgb24(message, 0xFFA500))

interface Label {
  text: string
  color: ColorFn
}

interface LabelMap {
  [key: string]: Label
}

interface LoggingConfig {
  namespace: string
  quiet: boolean
  timestamp: boolean
  stdout: Writer
}

interface LoggingOptions extends LoggingConfig {
  label: Label
}

const config: LoggingConfig = {
  namespace: '',
  quiet: false,
  timestamp: true,
  stdout: Deno.stdout,
}

export const configureLogging = (newConfig: Partial<LoggingConfig>): void => {
  Object.assign(config, newConfig)
}

export const LABELS: LabelMap = {
  debug: { text: 'DBG', color: boldBrightBlue },
  info: { text: 'INF', color: boldBrightWhite },
  warn: { text: 'WRN', color: boldBrightOrange },
  error: { text: 'ERR', color: boldBrightRed },

  add: { text: 'ADD', color: boldBrightGreen },
  modify: { text: 'MOD', color: boldBrightYellow },
  delete: { text: 'DEL', color: boldBrightMagenta },
  ready: { text: 'RDY', color: boldBrightBlue },
}

export const logMessage = (message: string, opts: Partial<LoggingOptions> = {}): void => {
  const quiet: boolean = opts.quiet ?? config.quiet ?? false
  if (quiet) return
  const timestamp: boolean = opts.timestamp ?? config.timestamp ?? true
  const namespace: string = opts.namespace ?? config.namespace ?? ''
  const label: Label | null = opts.label ?? null
  const ts = timestamp ? gray(`[${getTimestamp()}]`) : ''
  const ns = namespace ? cyan(`[${namespace}]`) : ''
  const lb = label !== null ? label.color(`[${label.text}]`) : ''
  const colon = ts || ns || lb ? ': ' : ''
  const stdout = opts.stdout ?? config.stdout ?? Deno.stdout
  write(`${ts}${ns}${lb}${colon}${message}\n`, stdout)
}

export const logSimple = (message: string, opts: Partial<LoggingOptions> = {}): void => logMessage(message, { timestamp: false, ...opts })
export const logDebug = (message: string, opts: Partial<LoggingOptions> = {}): void => logMessage(message, { label: LABELS.debug, ...opts })
export const logInfo = (message: string, opts: Partial<LoggingOptions> = {}): void => logMessage(message, { label: LABELS.info, ...opts })
export const logWarn = (message: string, opts: Partial<LoggingOptions> = {}): void => logMessage(message, { label: LABELS.warn, ...opts })
export const logError = (message: string, opts: Partial<LoggingOptions> = {}): void => logMessage(message, { label: LABELS.error, ...opts })
export const logAdd = (message: string, opts: Partial<LoggingOptions> = {}): void => logMessage(message, { label: LABELS.add, ...opts })
export const logModify = (message: string, opts: Partial<LoggingOptions> = {}): void => logMessage(message, { label: LABELS.modify, ...opts })
export const logDelete = (message: string, opts: Partial<LoggingOptions> = {}): void => logMessage(message, { label: LABELS.delete, ...opts })
export const logReady = (message: string, opts: Partial<LoggingOptions> = {}): void => logMessage(message, { label: LABELS.ready, ...opts })
