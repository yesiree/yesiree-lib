const express = require('express')
const Pid = require('../pid.js')
const search = require('./search.js')
const HttpError = require('../error.js')
const { isObject } = require('../util.js')
const apiStore = require('../storage.js').create('api')

const api = module.exports.apiRoutes = express.Router()

const operators = [
  's', 'ft', 'fulltext',
  '*', 'wildcard',
  'eq', 'gt', 'ge', 'lt', 'le',
  'true', 'false',
  'rei', 'regexi',
  're', 'regex'
]
let c = 0
const compare = (query, queryLower, value) => {
  const op = query.substr(0, query.indexOf(':'))
  const lhs = query.substr(query.indexOf(':') + 1)
  if (!op) throw HttpError(422, `Must provide query operator.`)
  if (!operators.includes(op)) throw HttpError(422, `Invalid query operator '${op}'.`)
  switch (op) {
    case '*':
    case 'wildcard':
      return value.toLowerCase().indexOf(lhs) !== -1
    case 'gt':
      return Number(value) > Number(lhs)
    case 'ge':
      return Number(value) >= Number(lhs)
    case 'lt':
      return Number(value) < Number(lhs)
    case 'le':
      return Number(value) <= Number(lhs)
    case 'false':
      return value === 'false' || value === '0' || !value
    case 'true':
      return value !== 'false' && value !== '0' && !!value
    case 're':
    case 'regex':
      return new RegExp(lhs).text(value)
    case 'rei':
    case 'regexi':
      return new RegExp(lhs, 'i').test(value)
    case 'eq':
    default:
      return query == value
  }
}

// /api/foo <- gets and object
// /api/foo[] <- gets a list
// /api/foo[0,9] <- gets the first ten items as a list
// /api/foo[,9] <- ditto
// /api/foo[10,] <- gets all the items starting with #10
// /api/foo[offset,limit]
const collectionRegex = /([^[]*)(?:\[([^,]+)?,?([^,]+)?\])$/
const getCollectionInfo = (originalPath) => {
  const results = collectionRegex.exec(originalPath) || []
  let [ isCollection, url = originalPath, offset = 0, limit = -1 ] = results
  isCollection = !!isCollection
  offset = Number(offset)
  limit = Number(limit)
  if (isNaN(offset)) throw HttpError(400, `Invalid offset: '${offset}'.`)
  if (isNaN(limit)) throw HttpError(400, `Invalid limit: '${limit}'.`)
  return { isCollection, url, offset, limit }
}
api.get('/*', (req, res) => {
  let { isCollection, url, offset, limit } = getCollectionInfo(req.path)
  const keys = url.split('/').filter(Boolean)
  let node = apiStore.data
  for (let i=0; i < keys.length; i++) {
    node = node[keys[i]]
    if (node === undefined) break;
  }
  if (isCollection) {
    node = Object.keys(node || {}).map((key) => {
      const obj = Object.assign({}, node[key])
      obj.$pid = key
      return obj
    })
    const fulltext = req.query['~']
    if (fulltext) {
      const index = fulltext.indexOf('|')
      if (index === -1) throw HttpError(400, `Malformed search query '${req.query['~']}' (e.g. '~=col1,col2|terms').`)
      const keys = fulltext.substr(0, fulltext.indexOf('|'))
        .split(',')
        .map(x => {
          const [key, weight = 1] = x.split(':')
          return { key, weight }
        })
      const term = fulltext.substr(fulltext.indexOf('|') + 1)
      node = search(term, node, keys)
    }
    node = node.filter((item) => {
      for (let p in item) {
        if (!item.hasOwnProperty(p)) continue
        let params = req.query[p]
        if (!params) continue
        if (!Array.isArray(params)) params = [params]
        for (let i=0; i < params.length; i++) {
          if (!compare(params[i], params[i].toLowerCase(), item[p])) return false
        }
      }
      return true
    })
    node = node.slice(offset, offset + (limit === -1 ? node.length : limit))
  } else if (node) {
    node['$pid'] = keys[keys.length - 1]
  }
  res.json(node)
})

api.post('/*', (req, res) => {
  const keys = req.path.split('/').filter(Boolean)
  let node = apiStore.data
  keys.forEach((key) => {
    if (!isObject(node[key])) node[key] = {}
    node = node[key]
  })
  node[Pid.create()] = req.body
  apiStore.save()
  res.json()
})

api.put('/*', (req, res) => {
  const keys = req.path.split('/').filter(Boolean)
  const $pid = keys.pop()
  let node = apiStore.data
  keys.forEach((key) => {
    if (!isObject(node[key])) node[key] = {}
    node = node[key]
  })
  node[$pid] = req.body
  apiStore.save()
  res.json()
})

api.patch('/*', (req, res) => {
  const keys = req.path.split('/').filter(Boolean)
  const $pid = keys.pop()
  let node = apiStore.data
  keys.forEach((key) => {
    if (isObject(node[key])) node[key] = {}
    node = node[key]
  })
  node[$pid] = Object.assign({}, node[$pid], req.body)
  apiStore.save()
  res.json()
})

api.delete('/*', (req, res) => {
  const keys = req.path.split('/').filter(Boolean)
  const $pid = keys.pop()
  let node = apiStore.data
  for (let i=0; i < keys.length; i++) {
    if (!isObject(node[key])) break
    node = node[key]
  }
  if (node) delete node[$pid]
  apiStore.save()
  res.json()
})
