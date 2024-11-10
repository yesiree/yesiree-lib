const jwt = require('jsonwebtoken')
const Pid = require('../pid.js')
const HttpError = require('../error.js')

module.exports = ({
  secret = '2sgzq73flmf9qxnrrfw5da58e4l0zdw8ztv3j5rirj73p81vpb9jpjo30u0f3cn2f4687bnqvbq96za0ygg5n22fpm4whgphc7az'
} = {}) => {

  return {
    sign (claims) {
      return jwt.sign(claims, secret, {
        algorithm: 'HS256',
        expiresIn: '14d',
        jwtid: Pid.create()
      })
    },
    verify (token) {
      return jwt.verify(token, secret, {
        algorithms: ['HS256']
      })
    },
    auth ({
      rules = []
    } = {}) {
      rules = rules.map((rule) => {
        if (!(rule.regex instanceof RegExp)) {
          rule.regex = new RegExp(rule)
        }
        return rule
      })
      return (req, res, next) => {
        const applicable = rules.filter(x => x.regex.test(req.path))
        if (applicable.length) {
          const token = (req.get('Authorization') || '').substr(7)
          try {
            req.user = this.verify(token)
          } catch (e) {
            throw new HttpError(403)
          }
          if (!applicable.every((x) => !x.roles || x.roles.includes(req.user.$roles))) {
            next(new HttpError(403))
          }
        }
        next()
      }
    }
  }
}
