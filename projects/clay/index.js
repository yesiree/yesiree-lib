const server = require('./lib/server.js')
const config = require('./lib/config.js')

config.setInMemory({
  "storagePath": ".clay",
  "port": 3080
})

server.start()
