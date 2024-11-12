import { assertEquals } from "@std/assert"
import { describe, it, beforeEach } from "@std/testing/bdd"
import { configureSpinner, printSpinners } from "../lib/spinner.ts"
import { createTestWriter } from "./utils.ts";

const writer = createTestWriter()

beforeEach(() => {
  writer.clear()
  configureSpinner({
    stdout: writer,
  })
})

describe("printSpinner", () => {
  it("prints spinner with default options.", () => {
    const promise = new Promise<void>((res) => res())
    printSpinners([{ label: 'test', promise }])
    const lines = writer.getOutput()
    assertEquals(lines, '| test\n')
  })
})
