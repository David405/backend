import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import pool from '../config/database'

export interface User {
  id?: number;
  email: string;
  password: string;
  isEmployer?: boolean;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  companyName?: string;
  role?: string;
  profession?: string;
}

export async function createUser(user: User): Promise<User | null> {
  try {
    
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const query = `INSERT INTO users (email, password, is_employer, first_name, last_name, phone_number, company_name, role, profession) 
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`;
    const values = [user.email, hashedPassword, user.isEmployer, user.firstName, user.lastName, user.phoneNumber, user.companyName, user.role, user.profession];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}