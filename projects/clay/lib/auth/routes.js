const express = require('express')
const HttpError = require('../error.js')
const Pid = require('../pid.js')
const jwt = require('./jwt.js')()
const hasher = require('./hasher.js')
const storage = require('../storage.js')
const authStore = storage.create('auth', {
  "users": {
    "c9m7oqv55uyh14xp65vgsd8hb": {
      "$pid": "c9m7oqv55uyh14xp65vgsd8hb",
      "username": "admin",
      "$password": "$2a$10$Fj8qzBzfLgdt3.9cpLsZIuYgiTO1gPNGbgOFGF5Z7j.6SiDWpc9IG", // admin?
      "role": "admin"
    }
  },
  "roles": [
    "admin",
    "user"
  ]
})

const auth = module.exports.authRoutes = express.Router()
auth.use(jwt.auth({
  rules: [{ regex: /^\/(users|roles|rules|refresh).*/ }]
}))

const findUser = (username) => {
  const $pid = Object
    .keys(authStore.data.users)
    .filter(x => authStore.data.users[x].username === username)
  if (!$pid) return
  const user = authStore.data.users[$pid]
  if (!user) return
  return Object.assign({}, user)
}

auth.post('/login', (req, res, next) => {
  const { username, password } = req.body
  const user = findUser(username)
  if (!user) return next(HttpError(403))
  if(!hasher.check(password, user.$password)) {
    return next(HttpError(403))
  }
  delete user['$password']
  res.json({ authToken: jwt.sign(user) })
})

auth.get('/refresh', (req, res, next) => {
  $pid = req.user.$pid
  const user = Object.assign({}, authStore.data.users[$pid])
  delete user['$password']
  res.json({ authToken: jwt.sign(user) })
})

auth.get('/users', (req, res) => {
  res.json(
    Object.keys(authStore.data.users).map(($pid) => {
      const user = Object.assign({}, authStore.data.users[$pid])
      delete user.$password
      return user
    })
  )
})

auth.get('/users/:pid', (req, res) => {
  const $pid = req.params.pid
  const user = Object.assign({}, authStore.data.users[$pid])
  delete user.$password
  if (!user) throw HttpError(404, 'User not found.')
  res.json(user)
})

auth.post('/users', (req, res) => {
  const user = req.body
  delete user.$password
  delete user.$pid
  const roles = authStore.data.roles
  const { username, role, $pass1, $pass2 } = user
  if (!username) throw HttpError(422, 'Must provide username')
  if (!role) throw HttpError(422, 'Must provide user role.')
  if (!$pass1 || !$pass2) throw HttpError(422, 'Must provide $pass1 and $pass2.')
  if ($pass1 !== $pass2) throw HttpError(422, 'Passwords do not match.')
  const existingUser = findUser(username)
  if (existingUser) throw HttpError(422, 'Username already in use.')
  const $pid = Pid.create()
  user.$pid = $pid
  user.$password = hasher.hash(user.$pass1)
  delete user.$pass1
  delete user.$pass2
  authStore.data.users[$pid] = user
  authStore.save()
  res.json()
})

auth.patch('/users/:pid', (req, res) => {
  const $pid = req.params.pid
  let user = req.body
  user.$pid = $pid
  delete user.$password
  const adminUser = findUser('admin')
  if ($pid === adminUser.$pid) {
    if (user.username !== 'admin') throw HttpError(422, 'Admin user cannot change username.')
    if (user.role !== 'admin') throw HttpError(422, 'Admin user cannot change role.')
  }
  const duplicate = Object.keys(authStore.data.users)
    .map(x => authStore.data.users[x])
    .filter(x => x.$pid !== $pid && x.username === user.username)
  if (duplicate.length) throw HttpError(422, 'Username already in use.')
  const storedUser = authStore.data.users[$pid]
  if (!storedUser) throw HttpError(404, 'User not found.')
  user = Object.assign({}, storedUser, user)
  const { $pass1, $pass2 } = user
  if ($pass1 || $pass2) {
    if (!$pass1 || !$pass2) throw HttpError(422, 'Must provide $pass1 and $pass2 to change password.')
    if ($pass1 !== $pass2) throw HttpError(422, 'Passwords do not match.')
    user.$password = hasher.hash($pass1)
  }
  delete user.$pass1
  delete user.$pass2
  authStore.data.users[$pid] = user
  authStore.save()
  res.json()
})

auth.delete('/users/:pid', (req, res) => {
  const $pid = req.params.pid
  const user = authStore.data.users[$pid]
  if (user.username === 'admin') {
    throw HttpError(422, 'Cannot delete the admin user.')
  }
  delete authStore.data.users[$pid]
  authStore.save()
  res.json()
})

auth.get('/roles', (req, res) => {
  res.json(authStore.data.roles)
})

auth.put('/roles', (req, res) => {
  const roles = req.body
  if (!Array.isArray(roles)) {
    throw HttpError(422, 'Roles must be an array.')
  }
  if (!roles.includes('admin')) {
    throw HttpError(422, `Roles array must include 'admin' role.`)
  }
  authStore.data.roles = roles
  authStore.save()
  res.json()
})

auth.get('/rules', (req, res) => {
  res.json(authStore.data.rules)
})

auth.put('/rules', (req, res) => {
  const rules = req.body
  if (!Array.isArray(rules)) {
    throw HttpError(422, 'Rules must be an array.')
  }
  authStore.data.rules = rules
  authStore.save()
  res.json()
})
