export interface Struct<T> {
  [key: string]: T
}

export interface Result<T> {
  value?: T
  errors: CliError[]
}

export class CliError extends Error {
  constructor(public type: CliErrorType) {
    super()
  }
  static commandNotFound = () => new CommandNotFoundError()
  static missingParameter = (param: Parameter) => new MissingParameterError(param)
  static invalidParameter = (param: Parameter) => new InvalidParameterError(param)
}

export class CommandNotFoundError extends CliError {
  constructor() {
    super(CliErrorType.CommandNotFound)
  }
}

export class MissingParameterError extends CliError {
  constructor(public param: Parameter) {
    super(CliErrorType.MissingParameter)
  }
}

export class InvalidParameterError extends CliError {
  constructor(public param: Parameter) {
    super(CliErrorType.InvalidParameter)
  }
}

export enum CliErrorType {
  CommandNotFound = 'CommandNotFound',
  MissingParameter = 'MissingParameter',
  InvalidParameter = 'InvalidParameter',
}

export interface ProgramDescriptor extends CommandDescriptor {
  version: string
  helpCommand?: CommandDescriptor
  versionCommand?: CommandDescriptor
}

export interface CommandDescriptor {
  name: string
  description?: string
  example?: string
  params?: ParameterDescriptor[]
  children?: CommandDescriptor[]
  run?: (args: RunArgs) => void
}

export interface ParameterDescriptor {
  name: string
  description: string
  example?: string
  type: ParameterType
  required?: boolean
  choices?: string[]
  fallback?: any
}

export interface Program extends Command {
  version: string
  helpCommand: Command
}

export interface Command {
  name: string
  description?: string
  example?: string
  params: ParameterDescriptor[]
  ancestors: Command[]
  children: Command[]
  run?: (args: RunArgs) => void
}

export interface Parameter {
  name: string
  description: string
  example?: string
  type: ParameterType
  required?: boolean
  choices?: string[]
  fallback?: any
  rawValue?: any
  value?: any
}



export interface ParametersResult {
  params: Parameter[]
  errors: CliError[]
}

export interface ParameterResult {
  param: Parameter
  errors: CliError[]
}

export enum ParameterType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Date = 'date',
  RegExp = 'regexp',
  List = 'list',
  Choice = 'choice',
}

interface Segments {
  raw: string[]
  command: string[]
  param: string[]
}

export interface CommandResult {
  command?: Command
  segments: Segments
  errors: CliError[]
}

export interface RunArgs {
  params: ParameterDescriptor[]
  segments: string[]
  command: Command
  program: Program
  errors?: CliError[]
}
