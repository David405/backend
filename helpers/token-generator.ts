import crypto from 'crypto'
import jwt from 'jsonwebtoken'

const JWT_SECRET: any = process.env.SECRET_KEY

export function generateToken(): string {
  return crypto.randomBytes(20).toString('hex')
}

export function generateJWToken(email: string): string {
  return jwt.sign({ email }, JWT_SECRET || '', { expiresIn: '1h' })
}

export function verifyJWToken(token: string): any {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (err) {
    return null
  }
}
