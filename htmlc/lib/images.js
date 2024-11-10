import sharp from 'sharp'
import { join, relative, resolve, dirname } from 'path'
import { getPathParts } from './utils.js'
import { mkdirp } from 'mkdirp'


const generateImageSetSizes = (width, height, sizes) => sizes.map(percent => ({
  width: Math.floor(width * percent),
  height: Math.floor(height * percent),
}))

const getImagePath = (inputDir, outputDir, file, size, type) => {
  const { name } = getPathParts(file)
  const relativeDir = dirname(relative(resolve(inputDir), resolve(file)))
  const relativePath = join(relativeDir, `${name}_${size}w.${type}`)
  const outputPath = join(outputDir, relativePath)
  return { relativePath, outputPath }
}

export const createImageSizer = ({
  sizes = [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1],
  type = 'webp',
  inputDir = 'src/',
  baseUrl = '/',
  outputDir = 'dest/',
} = {}) => {
  return async file => {
    if (!file) throw new Error('No file provided')

    const image = sharp(file)
    const metadata = await image.metadata()
    const { width, height } = metadata
    const imageSetSizes = generateImageSetSizes(width, height, sizes)

    const promises = imageSetSizes.map(async size => {
      const { outputPath } = getImagePath(inputDir, outputDir, file, size.width, type)
      await mkdirp(dirname(outputPath))
      await image
        .resize(size.width, size.height)
        .toFile(outputPath)
        .catch(err => console.error(err))
    })

    const srcsetAttrValues = imageSetSizes
      .map(size => {
        const { relativePath } = getImagePath(baseUrl, outputDir, file, size.width, type)
        return `${relativePath} ${size.width}w`
      })
      .join(', ')

    const sizesAttrValue = sizes
      .map(size => `(max-width: ${size.width}px) ${size.width}px`)
      .join(', ')

    await Promise.all(promises)
    return `srcset="${srcsetAttrValues}" sizes="${sizesAttrValue}"`
  }
}
