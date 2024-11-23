import { parseArgs } from 'jsr:@std/cli/parse-args'
import { getParameters } from './parameter.ts'
import type { ProgramDescriptor } from './schema.ts'
import { findCommand } from './command.ts'
import { compileProgram } from './program.ts'

const getArgs = () => {
  const { _, ...args } = parseArgs(Deno.args)
  return {
    args,
    segments: [
      ..._.map(segment => segment.toString())
    ]
  }
}

export const runProgram = (programDescriptor: ProgramDescriptor) => {
  const program = compileProgram(programDescriptor)
  const { helpCommand } = program
  const { segments, args } = getArgs()
  const { value: command, errors: commandErrors = [] } = findCommand(program, segments)
  const isRunnable = typeof command?.run === 'function'
  const commandToExecute = isRunnable ? command : helpCommand
  const {
    params: params = [],
    errors: paramErrors = []
  } = isRunnable ? getParameters(commandToExecute, args) : {}
  commandToExecute.run?.({
    params,
    segments,
    command: commandToExecute,
    program: program,
    errors: [...commandErrors, ...paramErrors]
  })
}
