const util = require('util')

const httpStatusMessages = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  418: 'I\'m a teapot',
  422: 'Unprocessable Entity',
  500: 'Server Error'
}

function HttpError(code, message) {
  if (!(this instanceof HttpError)) return new HttpError(code, message)
  this.code = code
  this.status = httpStatusMessages[code]
  this.name = HttpError.name
  this.message = message || this.status
  Error.captureStackTrace(this, HttpError)
}

util.inherits(HttpError, Error)

module.exports = HttpError
