import { CliError } from './schema.ts'
import { Command, Program, Result } from './schema.ts'

export const getProgram = (command: Command): Program => {
  return command.ancestors[0] as Program
}

export const getFullyQualifiedCommand = (command: Command): string => {
  return command.ancestors.map(ancestor => ancestor.name).join(' ') + ' ' + command.name
}

export const findCommand = (
  program: Program,
  segments: string[],
): Result<Command> => {
  const stack: Command[] = [program]
  let node: Command | undefined = program

  for (let i = 0; i < segments.length, node !== undefined; i++) {
    node = node.children?.find(child => child.name === segments[i])
    if (node) {
      stack.push(node)
    }
  }

  while (stack.length > 0) {
    const command = stack.pop()
    if (command?.run) {
      return {
        value: command,
        errors: []
      }
    }
  }

  return {
    errors: [CliError.commandNotFound()]
  }
}
