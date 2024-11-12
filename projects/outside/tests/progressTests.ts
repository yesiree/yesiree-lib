import { assertEquals } from "@std/assert"
import { describe, it, beforeEach } from "@std/testing/bdd"
import { configureProgress, printProgress } from "../lib/progress.ts"
import { createTestWriter } from "./utils.ts";

const writer = createTestWriter()

beforeEach(() => {
  writer.clear()
  configureProgress({
    stdout: writer,
  })
})

describe("printProgress", () => {
  it("prints progress bar with default options.", () => {
    const [runner] = printProgress([{ label: 'test', value: 0.5 }])
    runner.updateProgress(1)
    const lines = writer.getOutput()
    assertEquals(lines, ' 50% [==========          ] test \n\r100% [====================] test \r')
  })
})
