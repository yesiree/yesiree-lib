import { getHelpCommand, getVersionCommand } from './builtin.ts'
import { Command, CommandDescriptor, Program, ProgramDescriptor } from './schema.ts'

const compileCommandNode = (nodeDescriptor: CommandDescriptor, ancestors: Command[]): Command => {
  const node: Command = {
    name: nodeDescriptor.name,
    description: nodeDescriptor.description,
    example: nodeDescriptor.example,
    params: nodeDescriptor.params || [],
    ancestors: ancestors || [],
    children: [],
    run: nodeDescriptor.run
  }
  if (nodeDescriptor.children) {
    const childAncestors = [node, ...ancestors]
    node.children = nodeDescriptor.children.map(child => {
      return compileCommandNode(child, childAncestors)
    })
  }
  return node
}

export const compileProgram = (programDescriptor: ProgramDescriptor): Program => {
  const programCommand = compileCommandNode(programDescriptor, [])
  const program: Program = {
    ...programCommand,
    version: programDescriptor.version,
    helpCommand: null as unknown as Command,
  }
  const helpCommand = getHelpCommand(program, program.children.find(child => child.name === 'help'))
  const versionCommand = getVersionCommand(program, program.children.find(child => child.name === 'version'))
  program.helpCommand = helpCommand
  program.children.push(helpCommand, versionCommand)
  return program
}
