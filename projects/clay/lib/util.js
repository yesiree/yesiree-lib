const readline = require('readline')

const isObject = module.exports.isObject = x => x && typeof x === 'object'

const askOnce = (query) => {
  if (!query.label || !query.key) {
    throw Error(`Invalid query object. Must have 'label' and 'key' properties.`)
  }
  process.stdout.write(query.label)
  return new Promise((resolve, reject) => {
    rl.once('line', input => {
      switch (query.type) {
        case Number:
          input = +input
          break
      }
      resolve({
        key: query.key,
        input: input || query.fallback || ''
      })
    })
  })
}
const ask = module.exports.ask = (queries) => {
  if (!queries) {
    throw Error(`No queries provided.`)
  }
  if (!Array.isArray(queries)) {
    queries = [ queries ]
  }
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return queries
    .reduce((chain, query) => {
      return chain.then(results => {
        if (!query.label || !query.key) {
          throw Error(`Invalid query object. Must have 'label' and 'key' properties.`)
        }
        process.stdout.write(query.label)
        return new Promise((resolve, reject) => {
          rl.once('line', input => {
            switch (query.type) {
              case Number:
                input = +input
                break
            }
            results[query.key] = input || query.fallback || ''
            resolve(results)
          })
        })
      })
    }, Promise.resolve({}))
    .then(results => {
      rl.close()
      return results
    })
}
