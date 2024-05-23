const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.SECRET_KEY

function generateToken() {
  return crypto.randomBytes(20).toString('hex')
}

// function generateJWToken(email) {
//   return jwt.sign({ email }, JWT_SECRET || '', { expiresIn: '1h' })
// }
function generateJWToken(user) {
  return jwt.sign({ ...user }, JWT_SECRET || '');
}

function verifyJWToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    console.log(decoded)
    return decoded
  } catch (err) {
    return null
  }
}

module.exports = {
  generateToken,
  verifyJWToken,
  generateJWToken,
}
