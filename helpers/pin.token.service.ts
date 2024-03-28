import { v4 as uuidv4 } from 'uuid'

export function generateSixDigitNumber(): number {
  const uuid = uuidv4()

  const hexString = uuid.slice(-6)
  const hexNumber = parseInt(hexString, 16)

  return hexNumber % 1000000
}
