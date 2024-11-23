import { Command, Program, RunArgs } from './schema.ts'
import { getFullyQualifiedCommand } from './command.ts'

export const getVersionCommand = (program: Program, version?: Command): Command => {
  return version || {
    name: 'version',
    description: 'Displays the version of this program.',
    example: `${program.name} version`,
    params: [],
    ancestors: [program],
    children: [],
    run: () => {
      console.log(`${program.name} v${program.version}`)
    },
  }
}

export const getHelpCommand = (program: Program, help?: Command): Command => {
  return help || {
    name: 'help',
    description: 'Prints help information',
    example: `${program.name} help [group, ...] [command]`,
    params: [],
    ancestors: [program as Command],
    children: [],
    run: (args: RunArgs) => {
      let printout = `Usage: ${program.name} [group, ...] [command] [options]\n\n  Commands:\n\n`

      printout += program.children
        .map(child => {
          const isRunnable = typeof child.run === 'function'
          console.log(child.name, isRunnable)
          if (isRunnable) {
            return getCommandHelpPrintout(child)
          } else {
            return getGroupHelpPrintout(child)
          }
        })
        .join('\n')

      console.log(printout)
    },
  } as Command
}

const getCommandHelpPrintout = (command: Command) => {
  const fullyQualifiedCommand = getFullyQualifiedCommand(command)
  let printout = `    Usage: ${fullyQualifiedCommand} [options]\n\n      Options:\n\n`
  command.params.forEach(param => {
    printout += `        — ${param.name.padEnd(20)} ${param.description}\n`
  })
  return printout + '\n'
}

const getGroupHelpPrintout = (group: Command) => {
  let printout = `  ${group.name.padEnd(20)}\n  ${group.description || ''}\n`
  group.children.forEach(child => {
    printout += `    ${child.name.padEnd(20)} ${child.description}\n`
  })
  return printout
}
