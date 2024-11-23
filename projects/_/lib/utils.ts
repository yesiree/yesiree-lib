import { parse } from 'jsr:@std/yaml'
import { dirname } from 'jsr:@std/path'

interface ConfigMeta {
  configPath: string
  config: any
}

export const readConfig = (commandName: string): ConfigMeta => {
  let parentPath = Deno.cwd()
  let content = ''
  let configPath

  while (parentPath.length) {
    try {
      configPath = `${parentPath}/yesiree.yaml`
      content = Deno.readTextFileSync(configPath)
      if (content) {
        const yaml = parse(content) as any
        const config = yaml?.config?.commands[commandName]
        return { configPath, config }
      }
    } catch (e) {
      if (!(e instanceof Deno.errors.NotFound)) {
        throw e
      }
    }
    parentPath = dirname(parentPath)
  }

  console.error(`No configuration file found in or above ${Deno.cwd()}`)
  return {
    configPath: '',
    config: {
      updates: []
    }
  }
}
