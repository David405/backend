const { v4: uuidv4 } = require('uuid');

module.exports = function generateSixDigitNumber() {
  const uuid = uuidv4()

  const hexString = uuid.slice(-6)
  const hexNumber = parseInt(hexString, 16)

  return hexNumber % 1000000
}
