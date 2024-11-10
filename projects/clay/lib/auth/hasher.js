const bcrypt = require('bcryptjs')

module.exports = {
  hash (password) {
    var salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  },
  check (password, hash) {
    return bcrypt.compareSync(password, hash)
  }
}