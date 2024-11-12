import { bold, gray, cyan, brightBlue, brightWhite, brightRed, brightGreen, brightYellow, brightMagenta, rgb24 } from '@std/fmt/colors'
import { getTimestamp, type ColorFn } from './utils.ts'
import { ConsoleWriter, type TextWriter } from './writer.ts'

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
  writer?: TextWriter
}

interface LoggingOptions extends LoggingConfig {
  label: Label
}

const config: LoggingConfig = {
  namespace: '',
  quiet: false,
  timestamp: true,
}

/**
 * Configure the logging system.
 * @param newConfig - The new configuration.
 * @param newConfig.quiet - Whether to suppress log messages.
 * @param newConfig.namespace - The namespace to use for log messages.
 * @param newConfig.timestamp - Whether to include timestamps in log messages.
 * @returns void
 */
export const configureLogging = (newConfig: Partial<LoggingConfig>): void => {
  Object.assign(config, newConfig)
}

const LABELS: LabelMap = {
  debug: { text: 'DBG', color: boldBrightBlue },
  info: { text: 'INF', color: boldBrightWhite },
  warn: { text: 'WRN', color: boldBrightOrange },
  error: { text: 'ERR', color: boldBrightRed },

  add: { text: 'ADD', color: boldBrightGreen },
  modify: { text: 'MOD', color: boldBrightYellow },
  delete: { text: 'DEL', color: boldBrightMagenta },
  ready: { text: 'RDY', color: boldBrightBlue },
}

/**
 * Log a message.
 * @param message - The message to log.
 * @param opts - Additional options.
 * @param opts.quiet - Whether to suppress the message.
 * @param opts.namespace - The namespace to use for the message.
 * @param opts.timestamp - Whether to include a timestamp.
 * @return void
 */
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
  const writer = opts.writer ?? config.writer
  const cm = new ConsoleWriter(writer)
  cm.write(`${ts}${ns}${lb}${colon}${message}\n`)
}

/**
 * Log a simple message with no timestamp.
 * @param message - The message to log.
 * @param opts - Additional options.
 * @param opts.quiet - Whether to suppress the message.
 * @param opts.namespace - The namespace to use for the message.
 * @param opts.timestamp - Whether to include a timestamp.
 * @return void
 */
export const logSimple = (message: string, opts: Partial<LoggingOptions> = {}): void => logMessage(message, { timestamp: false, ...opts })

/**
 * Log a debug message, including a DBG label.
 * @param message - The message to log.
 * @param opts - Additional options.
 * @param opts.quiet - Whether to suppress the message.
 * @param opts.namespace - The namespace to use for the message.
 * @param opts.timestamp - Whether to include a timestamp.
 * @return void
 */
export const logDebug = (message: string, opts: Partial<LoggingOptions> = {}): void => logMessage(message, { label: LABELS.debug, ...opts })

/**
 * Log an informational message, including an INF label.
 * @param message - The message to log.
 * @param opts - Additional options.
 * @param opts.quiet - Whether to suppress the message.
 * @param opts.namespace - The namespace to use for the message.
 * @param opts.timestamp - Whether to include a timestamp.
 */
export const logInfo = (message: string, opts: Partial<LoggingOptions> = {}): void => logMessage(message, { label: LABELS.info, ...opts })

/**
 * Log a warning message, including a WRN label.
 * @param message - The message to log.
 * @param opts - Additional options.
 * @param opts.quiet - Whether to suppress the message.
 * @param opts.namespace - The namespace to use for the message.
 * @param opts.timestamp - Whether to include a timestamp.
 * @return void
 */
export const logWarn = (message: string, opts: Partial<LoggingOptions> = {}): void => logMessage(message, { label: LABELS.warn, ...opts })

/**
 * Log an error message, including an ERR label.
 * @param message - The message to log.
 * @param opts - Additional options.
 * @param opts.quiet - Whether to suppress the message.
 * @param opts.namespace - The namespace to use for the message.
 * @param opts.timestamp - Whether to include a timestamp.
 * @return void
 */
export const logError = (message: string, opts: Partial<LoggingOptions> = {}): void => logMessage(message, { label: LABELS.error, ...opts })

/**
 * Log an add message, including an ADD label.
 * @param message - The message to log.
 * @param opts - Additional options.
 * @param opts.quiet - Whether to suppress the message.
 * @param opts.namespace - The namespace to use for the message.
 * @param opts.timestamp - Whether to include a timestamp.
 * @return void
 */
export const logAdd = (message: string, opts: Partial<LoggingOptions> = {}): void => logMessage(message, { label: LABELS.add, ...opts })

/**
 * Log a modify message, including a MOD label.
 * @param message - The message to log.
 * @param opts - Additional options.
 * @param opts.quiet - Whether to suppress the message.
 * @param opts.namespace - The namespace to use for the message.
 * @param opts.timestamp - Whether to include a timestamp.
 * @return void
 */
export const logModify = (message: string, opts: Partial<LoggingOptions> = {}): void => logMessage(message, { label: LABELS.modify, ...opts })

/**
 * Log a delete message, including a DEL label.
 * @param message - The message to log.
 * @param opts - Additional options.
 * @param opts.quiet - Whether to suppress the message.
 * @param opts.namespace - The namespace to use for the message.
 * @param opts.timestamp - Whether to include a timestamp.
 * @return void
 */
export const logDelete = (message: string, opts: Partial<LoggingOptions> = {}): void => logMessage(message, { label: LABELS.delete, ...opts })

/**
 * Log a ready message, including a RDY label.
 * @param message - The message to log.
 * @param opts - Additional options.
 * @param opts.quiet - Whether to suppress the message.
 * @param opts.namespace - The namespace to use for the message.
 * @param opts.timestamp - Whether to include a timestamp.
 * @return void
 */
export const logReady = (message: string, opts: Partial<LoggingOptions> = {}): void => logMessage(message, { label: LABELS.ready, ...opts })
