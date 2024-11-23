import { runProgram } from './cli/index.ts'
import { updateDenoJson } from './commands/update-deno-json.ts'

runProgram({
  name: 'yesiree',
  version: '0.0.1',
  children: [
    updateDenoJson,
  ]
})
