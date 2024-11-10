const fs = require('fs')
const { join, dirname } = require('path')
const mkdirp = require('mkdirp')
const config = require('./config.js').get()

const getFilename = name => {
  return join(config.root, config.storagePath, `${name}.json`)
}
const getFile = (name, fallback) => {
  const filename = getFilename(name)
  try {
    return JSON.parse(fs.readFileSync(filename))
  } catch (e) {
    if (e.code !== 'ENOENT') throw e
    mkdirp.sync(dirname(filename))
    fs.writeFileSync(filename, JSON.stringify(fallback, null, 2))
    return fallback
  }
}

const cache = {}

const create = module.exports.create = (name, fallback = {}) => {
  if (cache[name]) return cache[name]
  return cache[name] = {
    data: getFile(name, fallback),
    save () {
      fs.writeFileSync(
        getFilename(name),
        JSON.stringify(this.data, null, 2)
      )
    }
  }
}
