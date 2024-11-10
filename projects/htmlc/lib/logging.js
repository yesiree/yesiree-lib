import chalk from 'chalk'

const now = () => {
  const date = new Date()
  const yyyy = date.getFullYear()
  const mm = ('' + (date.getMonth() + 1)).padStart(2, '0')
  const dd = ('' + date.getDate()).padStart(2, '0')
  const hh = ('' + date.getHours()).padStart(2, '0')
  const min = ('' + date.getMinutes()).padStart(2, '0')
  const sec = ('' + date.getSeconds()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}`
}

const levels = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

export const createLogger = (options) => {
  const opts = {
    name: '',
    quiet: false,
    time: true,
    level: 'info'
  }

  const configure = ({
    name = opts.name,
    quiet = opts.quiet,
    time = opts.time,
    level = opts.level,
  } = {}) => {
    if (!(level in levels)) {
      throw new Error(`Invalid log level: ${level}. Must be one of ${Object.keys(levels).join(', ')}.`)
    }

    opts.name = name || opts.name
    opts.quiet = quiet || opts.quiet
    opts.time = time || opts.time
    opts.level = level || opts.level
    opts.levelIndex = levels[opts.level],
    opts.ns = opts.name ? chalk.cyan(`[${opts.name}]`) : '',
    opts.ts = time => time ? chalk.gray(`[${now()}]`) : ''
  }

  configure(options)

  const debug = (message, {
    time = opts.time,
  } = {}) => {
    if (opts.quiet
      || opts.levelIndex > levels.debug
      || !console
      || !console.debug) return
    console.debug(`${opts.ts(time)}${opts.ns}: ${chalk.blueBright(message)}`)
  }

  const info = (message, {
    time = opts.time,
  } = {}) => {
    if (opts.quiet
      || opts.levelIndex > levels.info
      || !console
      || !console.log) return
    console.log(`${opts.ts(time)}${opts.ns}: ${chalk.whiteBright(message)}`)
  }

  const warn = (message, {
    time = opts.time,
  } = {}) => {
    if (opts.quiet
      || opts.levelIndex > levels.warn
      || !console
      || !console.warn) return
    console.warn(`${opts.ts(time)}${opts.ns}: ${chalk.yellowBright(message)}`)
  }

  const error = (message, {
    time = opts.time,
  } = {}) => {
    if (opts.quiet || !console || !console.error) return
    console.error(`${opts.ts(time)}${opts.ns}: ${chalk.redBright(message)}`)
  }

  return {
    debug,
    info,
    warn,
    error,
    configure
  }
}
