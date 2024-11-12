import type { TextWriter } from "../lib/writer.ts"
import { stripAnsiCode } from "@std/fmt/colors"


interface TestTextWriter extends TextWriter {
  clear(): void
  getLines(): string[]
  getOutput(): string
}

export const createTestWriter = (): TestTextWriter => {
  let output = ''
  const testTextWriter = (message: string) => {
    output += message
  }
  testTextWriter.clear = () => {
    output = ''
  }
  testTextWriter.getLines = () => {
    return stripAnsiCode(output).split('\n')
  }
  testTextWriter.getOutput = () => {
    return stripAnsiCode(output)
  }

  return testTextWriter
}
