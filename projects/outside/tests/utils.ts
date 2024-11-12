import type { Writer } from "../lib/utils.ts"
import { stripAnsiCode } from "@std/fmt/colors"

interface TestWriter extends Writer {
  clear(): void
  getLines(): string[]
  getOutput(): string
}

export const createTestWriter = (): TestWriter => {
  let isClosed = false
  let consoleOuptput = ''
  return {
    clear() {
      consoleOuptput = ''
    },
    getLines(): string[] {
      return stripAnsiCode(consoleOuptput).split('\n')
    },
    getOutput(): string {
      return stripAnsiCode(consoleOuptput)
    },
    write(p: Uint8Array): Promise<number> {
      if (isClosed) return Promise.reject(new Error("closed"))
      return Promise.resolve(this.writeSync(p))
    },
    writeSync: (data: Uint8Array): number => {
      if (isClosed) throw new Error("closed")
      consoleOuptput += new TextDecoder().decode(data)
      return data.length
    },
    close(): void {
      isClosed = true
    },
    isTerminal() {
      return true
    },
  }
}
