import { Pool, QueryResult } from 'pg'
import bcrypt from 'bcrypt'
import pool from '../config/database'

export interface User {
  id?: number
  email: string
  password: string
  is_employer?: boolean
  first_name?: string
  last_name?: string
  phone_number?: string
  company_name?: string
  role?: string
  profession?: string
  is_email_verified?: boolean
}

export async function createUser(user: User): Promise<User | null> {
  try {
    const hashedPassword = await bcrypt.hash(user.password, 10)
    const query = `INSERT INTO users (email, password, is_employer, first_name, last_name, phone_number, company_name, role, profession, is_email_verified)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`
    const values = [
      user.email,
      hashedPassword,
      user.is_employer,
      user.first_name,
      user.last_name,
      user.phone_number,
      user.company_name,
      user.role,
      user.profession,
      user.is_email_verified,
    ]

    const result = await pool.query(query, values)
    return result.rows[0]
  } catch (error) {
    console.error('Error creating user:', error)
    return null
  }
}

export async function verifyUserEmail(email: string | null): Promise<string> {
  try {
    const client = await pool.connect()
    const result: QueryResult<any> = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email],
    )

    if (result.rows.length === 0) {
      client.release()
      throw new Error('User does not exist')
    } else {
      await client.query(
        'UPDATE users SET is_email_verified = true WHERE email = $1',
        [email],
      )
      client.release()
      return 'Email verified and updated successfully'
    }
  } catch (err) {
    console.error('Error executing query', err)
    throw err
  }
}
