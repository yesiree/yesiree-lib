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

/**
 * Configure the progress bar with the given options.
 * @param opts Partial options to configure the progress bar.
 * @param opts.prefix The prefix to display before the progress bar.
 * @param opts.width The width of the progress bar.
 * @param opts.openChar The character to display at the start of the progress bar.
 * @param opts.openColor The color function to apply to the open character.
 * @param opts.closeChar The character to display at the end of the progress bar.
 * @param opts.closeColor The color function to apply to the close character.
 * @param opts.emptyChar The character to display for empty progress.
 * @param opts.emptyColor The color function to apply to the empty character.
 * @param opts.progressChar The character to display for progress.
 * @param opts.progressColor The color function to apply to the progress character.
 * @return void
 */
export const configureProgress = (opts: Partial<ProgressConfig>): void => {
  Object.assign(config, opts)
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

/**
 * Print the progress of the given tasks.
 * @param tasks The tasks to print progress for.
 * @param opts Partial options to configure the progress bar.
 * @param opts.prefix The prefix to display before the progress bar.
 * @param opts.width The width of the progress bar.
 * @param opts.openChar The character to display at the start of the progress bar.
 * @param opts.openColor The color function to apply to the open character.
 * @param opts.closeChar The character to display at the end of the progress bar.
 * @param opts.closeColor The color function to apply to the close character.
 * @param opts.emptyChar The character to display for empty progress.
 * @param opts.emptyColor The color function to apply to the empty character.
 * @param opts.progressChar The character to display for progress.
 * @param opts.progressColor The color function to apply to the progress character.
 * @return TaskRunner[] The task runners that can update the progress of the tasks.
 */
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
