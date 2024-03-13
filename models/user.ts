import { Pool, QueryResult } from 'pg'
import bcrypt from 'bcrypt'
import pool from '../config/database'

export interface User {
  id?: number
  email: string
  password: string
  isEmployer?: boolean
  firstName: string
  lastName: string
  phoneNumber: string
  companyName?: string
  role?: string
  profession?: string
  isEmailVerified?: boolean
}

export async function createUser(user: User): Promise<User | null> {
  try {
    const hashedPassword = await bcrypt.hash(user.password, 10)
    const query = `INSERT INTO users (email, password, is_employer, first_name, last_name, phone_number, company_name, role, profession, is_email_verified)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`
    const values = [
      user.email,
      hashedPassword,
      user.isEmployer,
      user.firstName,
      user.lastName,
      user.phoneNumber,
      user.companyName,
      user.role,
      user.profession,
      user.isEmailVerified,
    ]
    const result = await pool.query(query, values)
    return result.rows[0]
  } catch (error) {
    console.error('Error creating user:', error)
    return null
  }
}

export async function verifyUserEmail(email: string): Promise<string> {
  try {
    const client = await pool.connect()
    const result: QueryResult<any> = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email],
    )

    if (result.rows.length === 0) {
      client.release()
      return 'User does not exist'
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
