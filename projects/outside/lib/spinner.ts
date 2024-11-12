import { brightGreen, brightRed, gray, bold, brightYellow } from '@std/fmt/colors'
import type { ColorFn } from './utils.ts'
import { ConsoleWriter, type TextWriter } from './writer.ts'

interface SpinnerTask {
  label: string
  promise: Promise<unknown>
}

interface SpinnerRunner extends SpinnerTask {
  currentFrame: string
}

interface SpinnerFrameMap {
  [key: string]: string[]
}

interface SpinnerGeneratorOptions { _?: never }
interface SpinnerBeamGeneratorOptions extends SpinnerGeneratorOptions {
  spaceWidth?: number;
  spaceCharacter?: string;
  beamWidthPct?: number;
  beamCharacter?: string;
}

interface SpinnerFrameGeneratorMap {
  [key: string]: (options?: SpinnerGeneratorOptions) => string[];
}

interface SpinnerConfig {
  intervalDelay: number
  spinnerAlignment: 'left' | 'right'
  labelColor: ColorFn
  spinnerFrames: string[]
  spinnerColor: ColorFn
  successFrame: string
  successColor: ColorFn
  errorFrame: string
  errorColor: ColorFn
  writer?: TextWriter
}

interface SpinnerOptions extends SpinnerConfig { }

/**
 * A map of spinner generators. Each generator creates an array of frames for a spinner animation.
 * The generator is a function that will return a spinner set that can be passed to `configureSpinner` or `printSpinners`.
 */
export const SpinnerFrameGenerators: SpinnerFrameGeneratorMap = {
  BEAM({
    spaceWidth = 20,
    spaceCharacter = ' ',
    beamWidthPct = .2,
    beamCharacter = '='
  }: SpinnerBeamGeneratorOptions = {}): string[] {
    const beamWidth = Math.max(1, Math.floor(spaceWidth * beamWidthPct))
    const frames: string[] = []//[`[${spaceCharacter.repeat(spaceWidth)}]`]
    const createFrame = (index: number) => {
      const spaces = spaceCharacter.repeat(spaceWidth)
      const beamStart = index
      const beamEnd = index + beamWidth
      const gap = Math.min(0, beamStart, spaceWidth - beamEnd)
      const frame = spaces.substring(0, beamStart)
        + beamCharacter.repeat(beamWidth + gap)
        + spaces.substring(beamEnd)
      frames.push(`[${frame}]`)
    }
    for (let i = -beamWidth; i <= spaceWidth; i++) {
      createFrame(i)
    }
    for (let i = spaceWidth - 1; i >= -beamWidth + 1; i--) {
      createFrame(i)
    }
    return frames
  }
}

/**
 * A map of spinner sets. Each set contains an array of frames for a spinner animation.
 * The set is an array that can be passed to `configureSpinner` or `printSpinners`.
 */
export const SpinnerFrames: SpinnerFrameMap = {
  SOUND: ['🔊', '🔉', '🔈'],
  CLOCK: ['🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛'],
  HOURGLASS: ['⏳', '⌛'],
  EARTH: ['🌍', '🌎', '🌏'],
  MOON: ['🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔'],
  PULSE: ['·', '•', '●', '•'],
  ALPHA: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
  ROTATE: ['|', '/', '-', '\\'],
  ARROWS: ['←', '↖', '↑', '↗', '→', '↘', '↓', '↙'],
  ANGLES: ['◢', '◣', '◤', '◥'],
  CIRCLE: ['◐', '◓', '◑', '◒'],
  WAVE: ['[▁▃▅▇]', '[▃▃▅▅]', '[▅▅▃▃]', '[▇▅▃▁]', '[▅▅▃▃]', '[▃▃▅▅]'],
  PONG: ['▐•       ▌', '▐ •      ▌', '▐  •     ▌', '▐   •    ▌', '▐    •   ▌', '▐     •  ▌', '▐      • ▌', '▐       •▌', '▐      • ▌', '▐     •  ▌', '▐    •   ▌', '▐   •    ▌', '▐  •     ▌', '▐ •      ▌'],
  BOUNCE: ['[*  ]', '[ * ]', '[  *]', '[ * ]'],
  BACK_AND_FORTH: ['▉', '▊', '▋', '▌', '▍', '▎', '▏', '▎', '▍', '▌', '▋', '▊', '▉'],
  UP_AND_DOWN: ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█', '▇', '▆', '▅', '▄', '▃', '▁'],
}

const config: SpinnerConfig = {
  intervalDelay: 100,
  spinnerAlignment: 'left',
  labelColor: gray,
  spinnerFrames: SpinnerFrames.ROTATE,
  spinnerColor: (msg) => brightYellow(bold(msg)),
  successFrame: '✔',
  successColor: (msg) => brightGreen(bold(msg)),
  errorFrame: '✘',
  errorColor: (msg) => brightRed(bold(msg)),
}

/**
 * Configure the spinner with the given options.
 * @param opts The options to configure the spinner.
 * @param opts.intervalDelay The delay in milliseconds between each spinner frame.
 * @param opts.spinnerAlignment The alignment of the spinner relative to the label.
 * @param opts.labelColor The color function for the label.
 * @param opts.spinnerFrames The frames for the spinner animation (see `SpinnerGeneratorMap` or `SpinnerSetMap`).
 * @param opts.spinnerColor The color function for the spinner frames.
 * @param opts.successFrame The frame for the success animation (e.g. '✔').
 * @param opts.successColor The color function for the success frame.
 * @param opts.errorFrame The frame for the error animation (e.g. '✘').
 * @param opts.errorColor The color function for the error frame.
 * @return void
 */
export const configureSpinner = (opts: Partial<SpinnerConfig>): void => {
  Object.assign(config, opts)
}

const printTaskSpinner = (runner: SpinnerRunner, opts?: Partial<SpinnerOptions>): void => {
  const spinnerColor = opts?.spinnerColor ?? config.spinnerColor
  const labelColor = opts?.labelColor ?? config.labelColor
  const spinnerAlignment = opts?.spinnerAlignment ?? config.spinnerAlignment
  const spinnerText = spinnerAlignment === 'left'
    ? `${spinnerColor(runner.currentFrame)} ${labelColor(runner.label)}`
    : `${labelColor(runner.label)} ${spinnerColor(runner.currentFrame)}`
  const writer = opts?.writer ?? config.writer
  const cm = new ConsoleWriter(writer)
  cm.write(spinnerText)
}

const reprintTaskSpinner = (runner: SpinnerRunner, taskLine: number, opts?: Partial<SpinnerOptions>): void => {
  const writer = opts?.writer ?? config.writer
  const cm = new ConsoleWriter(writer)
  cm.moveUpLines(taskLine)
  cm.clearLine()
  printTaskSpinner(runner, opts)
  cm.moveDownLines(taskLine)
}

/**
 * Print a set of spinners for each task in the list.
 * @param tasks The list of tasks to print spinners for.
 * @param tasks[i].label The label for the task.
 * @param tasks[i].promise The promise for the task. Once the promise is fulfilled, the spinner will stop.
 * @param opts The options to configure the spinner.
 * @param opts.intervalDelay The delay in milliseconds between each spinner frame.
 * @param opts.spinnerAlignment The alignment of the spinner relative to the label.
 * @param opts.labelColor The color function for the label.
 * @param opts.spinnerFrames The frames for the spinner animation (see `SpinnerGeneratorMap` or `SpinnerSetMap`).
 * @param opts.spinnerColor The color function for the spinner frames.
 * @param opts.successFrame The frame for the success animation (e.g. '✔').
 * @param opts.successColor The color function for the success frame.
 * @param opts.errorFrame The frame for the error animation (e.g. '✘').
 * @param opts.errorColor The color function for the error frame.
 * @return void
 */
export const printSpinners = (tasks: SpinnerTask[], opts?: Partial<SpinnerOptions>): void => {
  const intervalDelay = opts?.intervalDelay ?? config.intervalDelay
  const spinnerAlignment = opts?.spinnerAlignment ?? config.spinnerAlignment
  const spinnerFrames = opts?.spinnerFrames ?? config.spinnerFrames
  const spinnerColor = opts?.spinnerColor ?? config.spinnerColor
  const spinnerWidth = spinnerFrames.reduce((a, c) => Math.max(a, c.length), 0)
  const successFrame = opts?.successFrame ?? config.successFrame
  const successColor = opts?.successColor ?? config.successColor
  const errorFrame = opts?.errorFrame ?? config.errorFrame
  const errorColor = opts?.errorColor ?? config.errorColor
  const writer = opts?.writer ?? config.writer
  const cm = new ConsoleWriter(writer)

  tasks.map((task, index) => {
    const taskLine = tasks.length - index
    let value = index % config.spinnerFrames.length
    const initialFrame = spinnerFrames[value % spinnerFrames.length]
    const runner: SpinnerRunner = {
      ...task,
      currentFrame: spinnerColor(initialFrame),
    }

    printTaskSpinner(runner, opts)
    cm.printNewline()

    const intervalId: number = setInterval(() => {
      value = value + 1 % config.spinnerFrames.length
      const frame = spinnerFrames[value % spinnerFrames.length]
      runner.currentFrame = spinnerColor(frame)
      reprintTaskSpinner(runner, taskLine, opts)
    }, intervalDelay)

    task.promise
      .then(() => {
        clearInterval(intervalId)
        const currentFrame = successColor(
          spinnerAlignment === 'left'
            ? successFrame.padStart(spinnerWidth, ' ')
            : successFrame
        )
        reprintTaskSpinner({ ...runner, currentFrame }, taskLine, opts)
      })
      .catch(() => {
        clearInterval(intervalId)
        const currentFrame = errorColor(
          spinnerAlignment === 'left'
            ? errorFrame.padStart(spinnerWidth, ' ')
            : errorFrame
        )
        reprintTaskSpinner({ ...runner, currentFrame }, taskLine, opts)
      })
  })
}
