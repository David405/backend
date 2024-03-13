import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'

import { createUser, User, verifyUserEmail } from '../models/user'
import { sendVerificationEmail } from '../helpers/email-service'
import { generateJWToken, verifyJWToken } from '../helpers/token-generator'

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
  const token = generateJWToken(email)

  console.log(email, token)

  const isSuccessful = await sendVerificationEmail(email, token)
  if (isSuccessful) {
    res.status(200).json('successfully verified')
  } else {
    res.status(500).send('Error verifying user')
  }
  
}

export async function verifyEmailToken(
  req: Request,
  res: Response,
): Promise<void> {
  const { token } = req.params

  try {
    const decoded = verifyJWToken(token)
    const email = decoded.email
    const verifyUser = await verifyUserEmail(email)
    if (verifyUser) {
      res.status(200).send('User verified successfully')
    } else {
      res.status(500).send('Error verifying user')
    }
  } catch (err) {
    res.status(500).send(err)
  }
}
