import { brightWhite, brightBlue } from '@std/fmt/colors'
import { identity, type ColorFn } from './utils.ts'
import { ConsoleWriter, type TextWriter } from './writer.ts'


interface ProgressConfig {
  prefix: string
  width: number
  openChar: string
  openColor: ColorFn
  closeChar: string
  closeColor: ColorFn
  emptyChar: string
  emptyColor: ColorFn
  progressChar: string
  progressColor: ColorFn
  writer?: TextWriter
}

interface ProgressOptions extends ProgressConfig { }

type TaskUpdater = (progress: number) => void

interface ProgressTask {
  label: string
  value?: number
}

interface TaskRunner {
  task: ProgressTask
  updateProgress: TaskUpdater
}

const config: ProgressConfig = {
  prefix: '',
  width: 20,
  openChar: '[',
  openColor: brightWhite,
  closeChar: ']',
  closeColor: brightWhite,
  emptyChar: ' ',
  emptyColor: identity,
  progressChar: '=',
  progressColor: brightBlue
}

export const configureProgress = (options: Partial<ProgressConfig>): void => {
  Object.assign(config, options)
}

const getOptions = (opts?: Partial<ProgressOptions>): ProgressOptions => {
  return { ...config, ...(opts || {}) }
}

const printTaskProgress = (task: ProgressTask, opts?: Partial<ProgressOptions>): void => {
  const { label, value = 0 } = task
  const optsOrConfig = getOptions(opts)
  const {
    prefix,
    width,
    openChar, openColor,
    closeChar, closeColor,
    progressChar, progressColor,
    emptyChar, emptyColor,
  } = optsOrConfig
  const open = openColor(openChar)
  const close = closeColor(closeChar)
  const progressCount = Math.floor(width * value)
  const progress = progressColor(progressChar.repeat(progressCount))
  const emptyCount = Math.max(width - progressCount, 0)
  const empty = emptyColor(emptyChar.repeat(emptyCount))
  const percent = `  ${Math.floor(value * 100)}%`.slice(-4)
  const progressText = `${prefix}${percent} ${open}${progress}${empty}${close} ${label} `
  const writer = optsOrConfig.writer
  const cm = new ConsoleWriter(writer)
  cm.write(progressText)
}

export const printProgress = (tasks: ProgressTask[], opts?: Partial<ProgressOptions>): TaskRunner[] => {
  const writer = opts?.writer ?? config?.writer
  const cm = new ConsoleWriter(writer)
  return tasks
    .map((task, index, tasks) => {
      const taskLine = tasks.length - index
      printTaskProgress(task, opts)
      cm.printNewline()
      return {
        task,
        updateProgress(value: number = 0) {
          task.value = value
          cm.moveUpLines(taskLine)
          printTaskProgress(task, opts)
          cm.moveDownLines(taskLine)
        }
      }
    })
}
