import { CommandDescriptor } from '../cli/schema.ts'
import { RunArgs } from '../cli/schema.ts'
import { readConfig } from '../utils.ts'
import { join, globToRegExp, dirname } from 'jsr:@std/path'
import { parse } from 'jsr:@std/yaml'

export const updateDenoJson: CommandDescriptor = {
  name: 'update-deno-json',
  description: 'Updates the deno.json file in all matching projects.',
  example: 'yesiree update-deno-json',
  run
}

async function run(_args: RunArgs) {
  const { configPath, config: { updates } } = readConfig('update-deno-json')
  const rootPath = dirname(configPath)
  for (const { template, include, exclude } of updates) {
    const includeRegex = globToRegExp(include)
    const excludeRegex = globToRegExp(exclude)

    const [
      templateJson,
      projectFolders
    ] = await Promise.all([
      new Promise<object | null>(resolve => {
        return typeof template === 'object'
          ? resolve(template)
          : resolve(readTemplateFile(template, rootPath))
      }),
      new Promise<string[]>(resolve => {
        const projectFolders = Array
          .from(Deno.readDirSync(rootPath))
          .filter(entry => entry.isDirectory
            && includeRegex.test(entry.name)
            && !excludeRegex.test(entry.name))
          .map(entry => entry.name)
        resolve(projectFolders)
      })
    ])

    if (!templateJson) {
      console.log(`\nTemplate file not found or not valid JSON: ${template}`)
      continue
    }

    if (!projectFolders.length) {
      console.log(`\nNo matching projects found in ${Deno.cwd()}`)
      continue
    }

    const results = (await Promise.all(
      projectFolders.map(async name => {
        const denoJsonPath = join(Deno.cwd(), name, 'deno.json')
        const denoJson = readDenoJsonFile(denoJsonPath)
        if (!denoJson) return { name, success: false }
        const newDenoJson = { ...denoJson, ...templateJson }
        const newDenoJsonString = JSON.stringify(newDenoJson, null, 2)
        await Deno.writeTextFile(denoJsonPath, newDenoJsonString)
        return { name, success: true }
      })
    )).filter(result => !result.success)

    if (results.length) {
      console.log(`\nSkipped non-deno projects:`)
      results.forEach(({ name }) => console.log(`  - ${name}`))
      console.log()
    }

  }
}

function readDenoJsonFile(denoJsonPath: string): object | null {
  try {
    return JSON.parse(Deno.readTextFileSync(denoJsonPath))
  } catch (e) {
    return null
  }
}

function readTemplateFile(templateFilename: string, rootPath: string): object | null {
  const templatePath = join(rootPath, templateFilename)
  try {
    const content = Deno.readTextFileSync(templatePath)
    if (templatePath.endsWith('.json')) {
      return JSON.parse(content)
    } else if (templatePath.endsWith('.yaml') || templatePath.endsWith('.yml')) {
      return parse(content) as object
    } else {
      console.log(`Template file is not JSON or YAML: ${templatePath}`)
      return null
    }
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      console.log(`Template file not found: ${templatePath}`)
    } else if (e instanceof SyntaxError) {
      console.log(`Template file is not valid JSON: ${templatePath}`)
    }
    return null
  }
}
