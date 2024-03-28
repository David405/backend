import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import pool from '../config/database'

import { createUser, User, verifyUserEmail } from '../models/user'
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../helpers/email.service'
import { generateJWToken, verifyJWToken } from '../helpers/token.generator'
import {
  getUserIdByEmail,
  verifyCode,
  deleteVerificationCode,
} from '../models/verification.code'
import { generateSixDigitNumber } from '../helpers/pin.token.service'

export async function registerUser(req: Request, res: Response): Promise<void> {
  const user: User = req.body
  try {
    const newUser = await createUser(user)
    if (newUser) {
      res.status(201).json(newUser)
    } else {
      res.status(500).send('Error creating user')
    }
  } catch (error) {
    res.status(500).send(error)
  }
}

export async function sendVerificationMail(
  req: Request,
  res: Response,
): Promise<void> {
  const { email } = req.body
  const code = generateSixDigitNumber()

  const client = await pool.connect()

  const userId = await getUserIdByEmail(email)

  try {
    const result = await client.query(
      'INSERT INTO verification_codes (user_id, code) VALUES ($1, $2) RETURNING *',
      [userId, code],
    )

    const isSuccessful = await sendVerificationEmail(email, code)
    if (isSuccessful) {
      res.status(200).json('verification mail sent')
    } else {
      res.status(500).send('Error sending verification mail')
    }
  } catch (err) {
    res.status(500).send(err)
  }
}

export async function verifyEmailToken(
  req: Request,
  res: Response,
): Promise<void> {
  const { code } = req.body

  try {
    const email = await verifyCode(code)

    const verifyUser = await verifyUserEmail(email)

    if (verifyUser) {
      res.status(200).send('User verified successfully')
      deleteVerificationCode(email)
    } else {
      res.status(500).send('Error verifying user')
    }
  } catch (err) {
    res.status(500).send(err)
  }
}

export async function loginUser(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body

  try {
    const query = 'SELECT * FROM users WHERE email = $1'
    const result = await pool.query(query, [email])

    if (result.rows.length === 0) {
      res.status(401).json({ message: 'Invalid email or password' })
      return
    }

    const user = result.rows[0]

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid email or password' })
      return
    }

    const token = generateJWToken(email)

    res.status(200).json({ token })
  } catch (error) {
    console.error('Error logging in:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export async function forgotPassword(
  req: Request,
  res: Response,
): Promise<void> {
  const { email } = req.body

  try {
    const code = generateSixDigitNumber()

    const client = await pool.connect()

    const userId = await getUserIdByEmail(email)

    const result = await client.query(
      'INSERT INTO verification_codes (user_id, code) VALUES ($1, $2) RETURNING *',
      [userId, code],
    )

    const isSuccessful = await sendPasswordResetEmail(email, code)
    if (isSuccessful) {
      res
        .status(200)
        .json({ message: 'Password reset instructions sent to your email' })
    } else {
      res.status(500).send('Error sending password reset mail')
    }
  } catch (error) {
    console.error('Error sending password reset instructions:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export async function changePassword(
  req: Request,
  res: Response,
): Promise<void> {
  const { currentPassword, newPassword, code } = req.body

  const email = await verifyCode(code)

  try {
    const query = 'SELECT * FROM users WHERE email = $1'
    const result = await pool.query(query, [email])

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    const user = result.rows[0]

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Current password is incorrect' })
      return
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    const updateQuery = 'UPDATE users SET password = $1 WHERE email = $2'
    await pool.query(updateQuery, [hashedNewPassword, email])

    res.status(200).json({ message: 'Password changed successfully' })
    deleteVerificationCode(email)
  } catch (error) {
    console.error('Error changing password:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export async function editUserProfile(
  req: Request,
  res: Response,
): Promise<void> {
  const token: any = req.headers.authorization?.split(' ')[1]
  const updatedData = req.body

  const decoded = verifyJWToken(token)
  const email = decoded.email

  try {
    const setClause = Object.keys(updatedData)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ')

    const values = Object.values(updatedData)
    values.push(email)

    const query = `
        UPDATE users 
        SET ${setClause}
        WHERE email = $${values.length}
      `
    await pool.query(query, values)

    res.status(200).json({ message: 'User profile updated successfully' })
  } catch (error) {
    console.error('Error updating user profile:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export async function getUserProfile(
  req: Request,
  res: Response,
): Promise<void> {
  const token: any = req.headers.authorization?.split(' ')[1]

  const decoded = verifyJWToken(token)
  const email = decoded.email

  try {
    const query = `
      SELECT * FROM users
      WHERE email = $1
    `
    const result = await pool.query(query, [email])

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User profile not found' })
      return
    }

    const userProfile = result.rows[0]
    res.status(200).json(userProfile)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
