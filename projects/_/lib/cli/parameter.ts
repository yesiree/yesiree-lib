import type { InvalidParameterError, MissingParameterError, ParameterResult, ParametersResult } from './schema.ts'
import { CliErrorType } from './schema.ts'
import { CliError } from './schema.ts'
import { Command, ParameterDescriptor, type Struct } from './schema.ts'

export const getParameters = (
  command: Command,
  args: Struct<string>
): ParametersResult => {
  const allErrors: CliError[] = []
  const params = [
    ...command.params,
    ...command.ancestors.flatMap(ancestor => ancestor.params || [])
  ].map(parameterDescriptor => {
    const value = args[parameterDescriptor.name]
    const { param, errors } = compileParameter(value, parameterDescriptor)
    allErrors.push(...errors)
    return param
  })
  return { params, errors: allErrors }
}

const compileParameter = (value: any, param: ParameterDescriptor): ParameterResult => {
  const errors: CliError[] = []
  const { type, required, choices, fallback } = param
  let newValue = value ?? fallback
  const isEmpty = newValue === undefined || newValue === null
  const missing = required && isEmpty

  if (missing) {
    errors.push({ type: CliErrorType.MissingParameter, param } as MissingParameterError)
  }

  if (!isEmpty && !choices?.includes(newValue)) {
    errors.push({ type: CliErrorType.InvalidParameter, param } as InvalidParameterError)
  }

  switch (type) {
    case 'number':
      if (!isNaN(Number(newValue))) {
        newValue = Number(newValue)
      } else if (missing) {
        errors.push({ type: CliErrorType.InvalidParameter, param } as InvalidParameterError)
      }
      break
    case 'boolean':
      if (['true', 'false'].includes(newValue)) {
        newValue = newValue === 'true'
      } else if (missing) {
        errors.push({ type: CliErrorType.InvalidParameter, param } as InvalidParameterError)
      }
      break
    case 'date':
      if (!isNaN(Date.parse(newValue))) {
        newValue = new Date(newValue)
      } else if (missing) {
        errors.push({ type: CliErrorType.InvalidParameter, param } as InvalidParameterError)
      }
      break
    case 'list':
      if (!Array.isArray(newValue)) {
        newValue = toArray(newValue)
      }
      break
    case 'regexp': {
      const match = isRegExp.exec(newValue)
      if (match) {
        const { pattern, flags } = match.groups || {}
        newValue = new RegExp(pattern, flags)
      } else if (missing) {
        errors.push({ type: CliErrorType.InvalidParameter, param } as InvalidParameterError)
      }
      break
    }
    default:
      throw new Error(`Unsupported parameter type: ${type}`)
  }

  return {
    param: {
      ...param,
      rawValue: value,
      value: newValue,
    },
    errors
  }
}

const isRegExp = /^\/(?<pattern>.*)\/(?<flags>[gimuy]*)$/
const toArray = (str: string) => str
  .split(/,(?=(?:[^'"]|'[^']*'|"[^"]*")*$)/g)
  .map(item => item.trim().replace(/^['"]|['"]$/g, ''))
