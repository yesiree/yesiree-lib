import chalk from 'chalk'

const config = {
  colorful: true,
  startBarChar: '[',
  endBarChar: ']',
  progressChar: '▪',
  progressColor: chalk.bold.greenBright,
  fillerChar: ' ',
  width: 20,
  barPrefix: '',
  labelPrefix: '  —  ',
}
config.get = (opts, ...keys) => keys.reduce((acc, key) => {
  acc[key] = opts?.[key] ?? config[key] ?? null
  return acc
}, {})

export const configureProgressBar = (opts = {}) => Object.assign(config, opts)
const colorize = (color, text, opts = {}) => {
  const { colorful } = config.get(opts, 'colorful')
  return colorful ? color(text) : text
}

const Emitter = () => {
  const listeners = {
    update: () => { },
    complete: () => { },
  }
  return {
    on(event, listener) {
      if (!listeners[event]) throw new Error(`Unknown event: ${event}`)
      listeners[event] = listener
      return this
    },
    update(progress) {
      listeners.update(progress)
    },
    complete() {
      listeners.complete()
    },
  }
}

const moveUpXLines = x => process.stdout.write(`\x1b[${x}A\r`)
const moveDownXLines = x => process.stdout.write(`\x1b[${x}B\r`)
const printNewline = () => console.log()
const printProgressLine = (label, progress, opts = {}) => {
  const {
    startBarChar, endBarChar, progressChar, progressColor, fillerChar, width, barPrefix, labelPrefix
  } = config.get(opts, 'startBarChar', 'endBarChar', 'progressChar', 'progressColor', 'fillerChar', 'width', 'barPrefix', 'labelPrefix')

  const chunks = new Array(width).fill(fillerChar)
  const progressIndex = Math.floor(progress * chunks.length)
  const progressChunk = colorize(progressColor, progressChar, opts)
  chunks.fill(progressChunk, 0, progressIndex)
  var bar = chunks.join('')
  var percent = `  ${Math.floor(progress * 100)}%`.slice(-4)
  var label = label ? `${labelPrefix}${label}` : ''
  process.stdout.write(`${barPrefix}${startBarChar}${bar}${endBarChar} ${percent}${label}`)
}

export const printProgress = (tasks, opts = {}) => {
  return tasks
    .map((task, i, tasks) => {
      const { label } = task
      const linesBackToTask = tasks.length - i

      printProgressLine(label, 0, opts)
      printNewline()

      const emitter = Emitter()
      emitter
        .on('update', progress => {
          moveUpXLines(linesBackToTask)
          printProgressLine(label, progress, opts)
          moveDownXLines(linesBackToTask)
        })
        .on('complete', () => {
          moveUpXLines(linesBackToTask)
          printProgressLine(label, 1, opts)
          moveDownXLines(linesBackToTask)
        })

      return { ...task, emitter }
    })
}
