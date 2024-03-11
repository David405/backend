import express, { Request, Response } from 'express';
import pool from './config/database';
import authRouter from './routes/auth-routes'

const app = express();

app.use(express.json());

app.use('/api/users', authRouter);

app.get('/', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT NOW() as now');
    res.json({ message: 'Hello, world!', dbTime: rows[0].now });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});