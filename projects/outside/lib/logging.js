import chalk from 'chalk'
import { getTimestamp } from './utils.js'

const config = {
  namespace: null,
  quiet: false,
  colorful: true,
  timestamp: true,
}

export const configureLogging = (opts = {}) => Object.assign(config, opts)

const get = (key, opts) => opts[key] ?? config[key] ?? null
const colorize = (color, text, opts = {}) => {
  const colorful = get('colorful', opts)
  return colorful ? color(text) : text
}

export const LABELS = {
  // Log levels
  debug: { text: 'DBG', color: chalk.bold.blueBright },
  info: { text: 'INF', color: chalk.bold.whiteBright },
  warn: { text: 'WRN', color: chalk.bold.hex('#FFA500') },
  error: { text: 'ERR', color: chalk.bold.redBright },

  // File Watch Statuses
  add: { text: 'ADD', color: chalk.bold.greenBright },
  modify: { text: 'MOD', color: chalk.bold.yellowBright },
  delete: { text: 'DEL', color: chalk.bold.magentaBright },
  ready: { text: 'RDY', color: chalk.bold.blueBright },
}

export const logMessage = (message, opts = {}) => {
  const quiet = get('quiet', opts)
  if (quiet) return
  const timestamp = get('timestamp', opts)
  const namespace = get('namespace', opts)
  const label = get('label', opts)
  const ts = timestamp ? colorize(chalk.gray, `[${getTimestamp()}]`) : ''
  const ns = namespace ? colorize(chalk.cyan, `[${namespace}]`) : ''
  const lb = label ? colorize(label.color, `[${label.text}]`) : ''
  const colon = ts || ns || lb ? ': ' : ''
  console.log(`${ts}${ns}${lb}${colon}${message}`)
}

export const logSimple = (message, opts) => logMessage(message, { timestamp: false, ...opts })
export const logDebug = (message, opts) => logMessage(message, { label: LABELS.debug, ...opts })
export const logInfo = (message, opts) => logMessage(message, { label: LABELS.info, ...opts })
export const logWarn = (message, opts) => logMessage(message, { label: LABELS.warn, ...opts })
export const logError = (message, opts) => logMessage(message, { label: LABELS.error, ...opts })
export const logAdd = (message, opts) => logMessage(message, { label: LABELS.add, ...opts })
export const logModify = (message, opts) => logMessage(message, { label: LABELS.modify, ...opts })
export const logDelete = (message, opts) => logMessage(message, { label: LABELS.delete, ...opts })
export const logReady = (message, opts) => logMessage(message, { label: LABELS.ready, ...opts })

configureLogging({ namespace: '' })

// examples:

out.logMessage('Hello, world!')
out.logSimple('Hello, world!')
out.logDebug('Hello, world!')
out.logInfo('Hello, world!')
out.logWarn('Hello, world!')
out.logError('Hello, world!')
out.logAdd('Hello, world!')
out.logModify('Hello, world!')
out.logDelete('Hello, world!')
out.logReady('Hello, world!')
