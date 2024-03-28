import pool from '../config/database'

export interface VerificationCode {
  user_id: number
  code: string
}

export async function getUserIdByEmail(email: string | null): Promise<number> {
  const client = await pool.connect()
  try {
    const result = await client.query('SELECT id FROM users WHERE email = $1', [
      email,
    ])
    if (result.rows.length === 0) {
      throw new Error('User not found')
    }
    return result.rows[0].id
  } finally {
    client.release()
  }
}

export async function verifyCode(code: string): Promise<string | null> {
  const client = await pool.connect()

  try {
    const verificationResult = await client.query(
      'SELECT user_id FROM verification_codes WHERE code = $1',
      [code],
    )

    if (verificationResult.rows.length === 0) {
      return null
    }

    const userId = verificationResult.rows[0].user_id
    const userResult = await client.query(
      'SELECT email FROM users WHERE id = $1',
      [userId],
    )

    if (userResult.rows.length === 0) {
      throw new Error('email not found')
    }

    return userResult.rows[0].email
  } finally {
    client.release()
  }
}

export async function deleteVerificationCode(
  email: string | null,
): Promise<void> {
  const client = await pool.connect()

  const userId = await getUserIdByEmail(email)
  try {
    await client.query('DELETE FROM verification_codes WHERE user_id = $1', [
      userId,
    ])
  } finally {
    client.release()
  }
}
