export type ColorFn = (message: string) => string

export interface Writer {
  write(p: Uint8Array): Promise<number>
  writeSync(p: Uint8Array): number
  close(): void
  isTerminal(): boolean
}

export const identity = <T>(value: T): T => value

export const encoder = new TextEncoder()
export const write = (message: string, stdout: Writer = Deno.stdout) => stdout.writeSync(encoder.encode(message))

export class ConsoleManager {
  constructor(private stdout: Writer = Deno.stdout) {
    this.stdout = stdout
  }

  moveUpLines(count: number) {
    this.stdout.writeSync(encoder.encode(`\x1b[${count}A\r`))
  }

  moveDownLines(count: number) {
    this.stdout.writeSync(encoder.encode(`\x1b[${count}B\r`))
  }

  moveToStartOfLine() {
    this.stdout.writeSync(encoder.encode('\r'))
  }

  clearLine() {
    if (this.stdout.isTerminal()) {
      const { columns } = Deno.consoleSize()
      Deno.stdout.writeSync(encoder.encode(`\r`))
      Deno.stdout.writeSync(encoder.encode(`${' '.repeat(columns)}`))
      Deno.stdout.writeSync(encoder.encode(`\r`))
    } else {
      this.stdout.writeSync(encoder.encode('\x1b[2K'))
    }
  }

  printNewline() {
    this.stdout.writeSync(encoder.encode('\n'))
  }
}

// export const moveToStartOfLine = () => Deno.stdout.writeSync(encoder.encode('\r'))
// export const moveUpXLines = (x: number) => Deno.stdout.writeSync(encoder.encode(`\x1b[${x}A\r`))
// export const moveDownXLines = (x: number) => Deno.stdout.writeSync(encoder.encode(`\x1b[${x}B\r`))
// export const writeOver = (char: string, count: number) => {
//   const { columns } = Deno.consoleSize()
//   Deno.stdout.writeSync(encoder.encode(`\r`))
//   Deno.stdout.writeSync(encoder.encode(`${' '.repeat(columns)}`))
//   Deno.stdout.writeSync(encoder.encode(`\r`))
// }
// export const printNewline = () => console.log()

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
