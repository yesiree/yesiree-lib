#!/usr/bin/env node

const getopts = require('getopts')
const config = require('./lib/config.js')
const args = getopts(process.argv)
const { ask } = require('./lib/util.js')

const opts = {
  init: args['_'].indexOf('init') !== -1,
  clean: args['_'].indexOf('clean') !== -1
}

if (opts.init) {
  // create and save config object
  console.log(`\nInitializing clay instance, please answer the following questions...\n`)
  ask([{
      label: '  Storage path relative to root? (.clay) ',
      key: 'storagePath',
      fallback: '.clay'
    },{
      label: '  HTTP port? (3080) ',
      key: 'port',
      fallback: 3080,
      type: Number
  }]).then(cfg => {
    const out = JSON.stringify(cfg, null, 2)
    return ask([{
      label: `\nSaving the following configuration for clay:\n\n${out}\n\nIs this information correct? (yes) `,
      key: 'confirm',
      fallback: 'yes'
    }]).then(({ confirm }) => {
      confirm = confirm.toLowerCase()
      if (confirm === 'y' || confirm === 'yes') {
        config.set(cfg)
      }
    }).catch(err => {
      console.error(err)
    })
  })
} else if (opts.clean) {
  config.clean()
} else {
  // run clay
  const server = require('./lib/server.js')
  server.start()
}
