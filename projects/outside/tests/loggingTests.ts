import { assertEquals, assertMatch } from "@std/assert"
import { describe, it, beforeEach } from "@std/testing/bdd"
import { createTestWriter } from "./utils.ts";
import {
  configureLogging,
  logMessage,
  logSimple,
  logDebug,
  logInfo,
  logWarn,
  logError,
  logAdd,
  logModify,
  logDelete,
  logReady,
} from "../lib/logging.ts"


const writer = createTestWriter()

beforeEach(() => {
  writer.clear()
  configureLogging({
    namespace: '',
    quiet: false,
    timestamp: true,
    writer,
  })
})

describe("configureLogging", () => {
  it("produces no output when `{ quiet = true }`.", () => {
    configureLogging({ quiet: true, timestamp: false })
    logMessage('quiet')
    configureLogging({ quiet: false, timestamp: false })
    logMessage('load')
    const [line1, line2] = writer.getLines()
    assertEquals(line1, 'load')
    assertEquals(line2, "")
  })

  it("produces output with namespace when provided.", () => {
    configureLogging({ namespace: 'ns', timestamp: false })
    logMessage('test')
    configureLogging({ namespace: '', timestamp: false })
    logMessage('test')
    const [line1, line2] = writer.getLines()
    assertEquals(line1, '[ns]: test')
    assertEquals(line2, 'test')
  })

  it("produces output with timestamp when `{ timestamp = true }`.", () => {
    configureLogging({ timestamp: true })
    logMessage('test')
    configureLogging({ timestamp: false })
    logMessage('test')
    const [line1, line2] = writer.getLines()
    assertMatch(line1, /^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]: test$/)
    assertEquals(line2, 'test')
  })
})

describe("logMessage", () => {
  it("produces standard output.", () => {
    logMessage('test')
    const [line] = writer.getLines()
    assertMatch(line, /^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]: test$/)
  })
})

describe("logSimple", () => {
  it("produces standard output.", () => {
    logSimple('test')
    const [line] = writer.getLines()
    assertEquals(line, "test")
  })
})

describe("logDebug", () => {
  it("produces debug output.", () => {
    logDebug('test')
    const [line] = writer.getLines()
    assertMatch(line, /^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]\[DBG\]: test$/)
  })
})

describe("logInfo", () => {
  it("produces info output.", () => {
    logInfo('test')
    const [line] = writer.getLines()
    assertMatch(line, /^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]\[INF\]: test$/)
  })
})

describe("logWarn", () => {
  it("produces warn output.", () => {
    logWarn('test')
    const [line] = writer.getLines()
    assertMatch(line, /^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]\[WRN\]: test$/)
  })
})

describe("logError", () => {
  it("produces error output.", () => {
    logError('test')
    const [line] = writer.getLines()
    assertMatch(line, /^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]\[ERR\]: test$/)
  })
})

describe("logAdd", () => {
  it("produces add output.", () => {
    logAdd('test')
    const [line] = writer.getLines()
    assertMatch(line, /^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]\[ADD\]: test$/)
  })
})

describe("logModify", () => {
  it("produces modify output.", () => {
    logModify('test')
    const [line] = writer.getLines()
    assertMatch(line, /^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]\[MOD\]: test$/)
  })
})

describe("logDelete", () => {
  it("produces delete output.", () => {
    logDelete('test')
    const [line] = writer.getLines()
    assertMatch(line, /^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]\[DEL\]: test$/)
  })
})

describe("logReady", () => {
  it("produces ready output.", () => {
    logReady('test')
    const [line] = writer.getLines()
    assertMatch(line, /^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]\[RDY\]: test$/)
  })
})
