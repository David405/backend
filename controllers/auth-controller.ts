import { Request, Response } from 'express';
import { createUser, User } from '../models/user';

export async function registerUser(req: Request, res: Response): Promise<void> {
  const user: User = req.body;
  try {
    const newUser = await createUser(user);
    if (newUser) {
      res.status(201).json(newUser);
    } else {
      res.status(500).send('Error creating user');
    }
  } catch (error) {
    res.status(500).send('Error creating user');
  }
}