const os = require('os')
const fs = require('fs')
const path = require('path')
const rimraf = require('rimraf')

const CONFIG_KEY = '@yesiree/clay'
const SYS_ROOT = (os.platform == "win32") ? process.cwd().split(path.sep)[0] : "/"
const RIMRAF_OPTS = { disableGlob: true }

let config

module.exports = {
  get (fallback = {
    storagePath: '.clay',
    port: 3080
  }) {
    if (!config) {
      const { cfg = {}, file } = _find() || {}
      config = Object.assign({}, fallback, cfg, {
        root: file ? path.dirname(file) : process.cwd()
      })
    }
    return config
  },
  setInMemory (_config = {}) {
    config = Object.assign({}, _config, {
      root: process.cwd()
    })
  },
  set (config = {}) {
    const { pkg, file } = _find() || {}
    if (!pkg || !file) {
      throw Error(`Unable to save to 'package.json'. No package found.`)
    }
    pkg.config = pkg.config || {}
    pkg.config[CONFIG_KEY] = config
    fs.writeFileSync(file, JSON.stringify(pkg, null, 2))
  },
  clean (sync = false) {
    const config = this.get()
    if(sync) {
      rimraf.sync(config.storagePath, RIMRAF_OPTS)
    } else {
      return new Promise((resolve, reject) => {
        rimraf(config.storagePath, RIMRAF_OPTS, (err) => {
          if (err) return reject(err)
          resolve()
        })
      })
    }
  }
}

const _find = () => {
  let root = process.cwd()
  do {
    const file = path.join(root, 'package.json')
    try {
      const pkg = JSON.parse(fs.readFileSync(file))
      if (!pkg.config) pkg.config = {}
      const cfg = pkg.config[CONFIG_KEY]
      return { pkg, cfg, file }
    } catch (e) {
      if (e.code === 'ENOENT') {
        root = path.resolve(root, '..')
      } else {
        throw e
      }
    }
  } while (root !== SYS_ROOT)
}
