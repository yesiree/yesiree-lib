const path = require('path')
const express = require('express')
const HttpError = require('./error.js')
const bodyParser = require('body-parser')
const { authRoutes } = require('./auth/routes.js')
const { apiRoutes } = require('./api/routes')
const config = require('./config').get()
const app = express()

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === 'OPTIONS') {
    res.status(200).send()
  } else {
    next()
  }
});
app.use(bodyParser.json())
app.get('/ping', (req, res) => res.json({ message: 'pong', timestamp: new Date() }))
app.use('/auth/', authRoutes)
app.use('/api/', apiRoutes)
app.use((err, req, res, next) => {
  if (err instanceof HttpError) {
    res.status(err.code).json({
      code: err.code,
      status: err.status,
      message: err.message
    })
  } else {
    console.error(err)
    res.status(500).json({
      message: err.message,
      stack: err.stack.split('\n')
    })
  }
})

module.exports = {
  start () {
    app.listen(config.port, () => {
      console.log(`  Listening at localhost:${config.port}...`)
    })
  }
}
