
export type TextWriter = (message: string) => void
interface DenoWriter { writeSync(p: Uint8Array): void }
interface NodeWriter { write(p: string): void }
interface GlobalDeno { stdout: DenoWriter }
interface GlobalProcess { stdout: NodeWriter }
declare namespace globalThis {
  const Deno: GlobalDeno
  const process: GlobalProcess
}
const isDeno = typeof globalThis['Deno'] !== 'undefined'
const isNode = typeof globalThis['process'] !== 'undefined'

export class ConsoleWriter {
  constructor(writer?: TextWriter) {
    if (writer) {
      this.write = writer
    } else if (isDeno) {
      const denoStdout = globalThis['Deno'].stdout
      const encoder = new TextEncoder()
      this.write = (message: string) => {
        denoStdout.writeSync(encoder.encode(message))
      }
    } else if (isNode) {
      const nodeStdout = globalThis['process'].stdout
      this.write = (message: string) => {
        nodeStdout.write(message)
      }
    }
  }

  write(message: string) {
    this.write(message)
  }

  moveUpLines(count: number) {
    this.write(`\x1b[${count}A\r`)
  }

  moveDownLines(count: number) {
    this.write(`\x1b[${count}B\r`)
  }

  moveToStartOfLine() {
    this.write('\r')
  }

  clearLine() {
    this.write('\x1b[2K')
  }

  printNewline() {
    this.write('\n')
  }
}
