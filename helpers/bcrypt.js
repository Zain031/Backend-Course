const bcrypt = require('bcryptjs');

module.exports = {
    hashPassword : (password) => {
        return bcrypt.hashSync(password)
    },
    comparePassword : (password, hashedPassword) => {
        return bcrypt.compareSync(password, hashedPassword)
    }
}