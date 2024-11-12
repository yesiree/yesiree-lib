import { join, relative, extname } from 'path'
import * as terser from 'terser'
import jsdom from 'jsdom'
import * as sass from 'sass'
import htmlMinifier from 'html-minifier-terser'
import htmlFormatter from 'js-beautify'
import chokidar from 'chokidar'
import chalk from 'chalk'
import fastGlob from 'fast-glob'
import mime from 'mime'
import { logInfo } from '@yesiree/outside'
import { createImageSizer } from './images.js'
import {
  read,
  read64,
  write,
  copy,
  getAsIndexPath,
  getPkgVersion,
  getRelativePath,
  getResolvedPath
} from './utils.js'


const linkRegex = /(?:http(?:s)?:)?\/\//i

const getDom = async (htmlPath) => {
  const html = await read(htmlPath)
  const virtualConsole = new jsdom.VirtualConsole()
  const dom = new jsdom.JSDOM(html, { virtualConsole })
  return { html, dom, virtualConsole }
}

const processImages = async ({
  doc,
  htmlPath,
  rootDir,
  outputDir,
  inline = false
} = {}) => {
  const imageSizer = createImageSizer({
    inputDir: rootDir,
    outputDir,
    baseUrl: '/',
  })
  return Array
    .from(doc.querySelectorAll('img[src]'))
    .map(async element => {
      const src = element.getAttribute('src')
      const inline = element.hasAttribute('htmlc-inline')
      element.removeAttribute('htmlc-inline')
      const imageInputPath = getResolvedPath(htmlPath, src)
      if (inline) {
        const mimeType = mime.lookup(extname(src))
        const data64 = await read64(imageInputPath)
        element.setAttribute('src', `data:${mimeType};base64,${data64}`)
      } else {
        const inPath = join(basePath, src)
        const outPath = join(dest, src)
        await copy(imageInputPath, outPath)
      }
    })
}

export const compileFile = async (
  htmlPath, {
    source = '',
    dest = './',
    compress = true,
    module = true,
    index = false,
    inline = false
  }
) => {
  const { dom } = await getDom(htmlPath)
  const doc = dom.window.document
  const basePath = getBasePath(htmlPath, dom)

  console.log({
    htmlPath,
    source,
    dest
  })

  await Promise.all([
    Promise.resolve().then(async () => {
      await Promise.all(
        Array
          .from(doc.querySelectorAll('img[src]'))
          .map(async element => {
            const src = element.getAttribute('src')
            const inline = element.hasAttribute('inline')
            element.removeAttribute('inline')
            if (inline) {
              const mimeType = mime.lookup(extname(src))
              const data64 = await read64(join(basePath, src))
              element.setAttribute('src', `data:${mimeType};base64,${data64}`)
            } else {
              const inPath = join(basePath, src)
              const outPath = join(dest, src)
              await copy(inPath, outPath)
            }
          })
      )
    }),
    Promise.resolve().then(async () => {
      const assets = await Promise.all(
        Array
          .from(doc.querySelectorAll('link[rel="stylesheet"],style'))
          .filter(element => !linkRegex.test(element.href))
          .map(async element => {
            element.remove()
            const href = element.getAttribute('href')
            return href
              ? await read(join(basePath, href))
              : element.textContent
          })
      )
      const css = await Promise.all(
        assets
          .filter(x => typeof x === 'string' && !!x)
          .map(async asset => {
            try {
              return await sass.compileString(asset, {
                loadPaths: [basePath],
                style: compress ? 'compressed' : 'expanded'
              })?.css || ''
            } catch (e) {
              console.error(e)
              return ''
            }
          })
      )
      const style = doc.createElement('style')
      style.textContent = css.join('\n')
      doc.head.append(style)
    }),
    Promise.resolve().then(async () => {
      let js = (await Promise.all(
        Array
          .from(doc.querySelectorAll('script'))
          .map(async element => {
            element.remove()
            const src = element.getAttribute('src')
            return src
              ? await read(join(basePath, src))
              : element.textContent
          })
      )).join(';\n')
      if (compress || true) {
        try {
          const result = await terser.minify(js, { toplevel: true })
          js = result.code || ''
        } catch (e) { /* ignore syntax errors from terser */ }
      }
      const script = doc.createElement('script')
      script.textContent = `\n${js}`
      if (module) script.setAttribute('type', 'module')
      doc.body.append(script)
    })
  ])

  const html = await minifyHtml(dom.serialize(), { compress })
  let destPath = join(dest, relative(source, index ? getAsIndexPath(htmlPath) : htmlPath))
  await write(destPath, html)
  return destPath
}

const minifyHtml = async (htmlContent, opts) => {
  const { compress } = opts || {}
  if (compress) {
    return htmlMinifier.minify(htmlContent, {
      collapseWhitespace: true,
      removeComments: true,
    })
  } else {
    return htmlFormatter.html(htmlContent, {
      indent_size: 2,
      indent_char: ' ',
      eol: '\n',
      preserve_newlines: false
    })
  }
}

export const copyOtherFiles = async (source, dest, pattern) => {
  const files = await fastGlob(join(source, pattern))
  return Promise.all(
    files.map(async inPath => {
      const outPath = join(dest, relative(source, inPath))
      try {
        await copy(inPath, outPath)
      } catch (e) {
        console.error(`Failed to copy ${inPath} to ${outPath}.`)
      }
    })
  )
}





const types = {
  'MOD': chalk.magenta('MOD'),
  'ADD': chalk.green('ADD'),
  'DEL': chalk.red('DEL'),
  'RDY': chalk.blue('READY'),
}

const styles = {
  path: chalk.blueBright,
  success: chalk.greenBright
}

/**
 * @param {object} options
 * @param {string} options.source — The source directory from which content will be compiled.
 * @param {string} options.dest — The output directory to which compiled content will be written.
 * @param {boolean} options.watch — If true, `htmlc` will continue to watch the file system and re-compile whenever changes are detected.
 * @param {string} options.compress — If true, html, css, and javascript will be compressed.
 * @param {string} options.module — If true, scripts will have their `type` attribute set to `module`.
 * @param {string} options.index — If true, `htmlc` will compile an `index.html` file for each directory.
 * @param {boolean} options.inline — If true, `htmlc` will inline images in the compiled HTML files.
 * @param {string} options.ext — The extension of the pre-compiled HTML files. Defaults to `.html`, but can be altered to accommodate the file extensions of templating engines such as nunjucks.
 * @param {string} options.other — If true, copy all files that match the pattern to the destination directory.
 * @param {boolean} options.quiet — If true, `htmlc` will not log to the console.
 *
 * @returns {Promise<void>}
 */
export const htmlc = async ({
  source = 'src/',
  dest = 'dest/',
  watch = false,
  compress = true,
  module = true,
  index = false,
  inline = false,
  ext = '.html',
  other = false,
  quiet = true
} = {}) => {

  const version = await getPkgVersion()
  const logger = createLogger({ quiet })
  const logCliInfo = () => {
    logger.info(`htmlc v${version}`)
    logger.info('')
  }
  const logUpdate = (type, path) => logger.info(`${types[type]} ${styles.path(path)}`)
  const logCompiling = (path) => logger.info(`  Compiling ${styles.path(path)}...`)
  const logWriting = (path) => logger.info(`    Writing ${styles.path(path)}...`)
  const logCompletion = (compiledCount, copiedCount) => {
    const compiledPlural = compiledCount === 1 ? '' : 's'
    const copiedPlural = copiedCount === 1 ? '' : 's'
    const copiedMessage = other ? `, ${copiedCount} file${copiedPlural} copied.` : '.'
    const message = `   ${styles.success('Finished')} ${compiledCount} file${compiledPlural} compiled${copiedMessage}.`
    logger.info('')
    logger.info(message)
  }

  const opts = {
    source,
    dest,
    compress,
    module,
    index,
    inline
  }

  try {
    const htmlRegistry = []
    const initial = []
    let isReady = false
    if (watch) {

      const remove = async (type, path) => {
        if (path.endsWith(ext)) {
          const index = htmlRegistry.indexOf(path)
          if (index > -1) htmlRegistry.splice(index, 1)
        }
        logUpdate(type, path)
      }

      const update = async (type, path = '') => {
        await Promise.all(
          htmlRegistry.map(x => compileFile(x, opts))
        )
        if (type === 'RDY') {
          isReady = true
          await Promise.all(initial)
        }
        logUpdate(type, path)
      }

      const register = async (type, path) => {
        if (path.endsWith(ext)) {
          htmlRegistry.push(path)
          const promise = compileFile(path, opts)
          if (!isReady) initial.push(promise)
          await promise
        }
        logUpdate(type, path)
      }

      return chokidar
        .watch(source)
        .on('add', register.bind(null, 'ADD'))
        .on('change', update.bind(null, 'MOD'))
        .on('unlink', remove.bind(null, 'DEL'))
        .on('ready', update.bind(null, 'RDY'))

    } else {
      logCliInfo()

      const files = await fastGlob(join(source, '**'))
      const promises = [
        Promise.all(
          files
            .filter(x => x.endsWith(ext))
            .map(async htmlFile => {
              logCompiling(htmlFile)
              const outPath = await compileFile(htmlFile, opts)
              logWriting(outPath)
            })
        )
      ]

      if (other) {
        promises.push(copyOtherFiles(source, dest, other))
      }

      const [
        { length: compiledCount = 0 } = {},
        { length: copiedCount = 0 } = {}
      ] = await Promise.all(promises)
      logCompletion(compiledCount, copiedCount)
    }
  } catch (e) {
    console.error(e)
  }
}
