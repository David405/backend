const express = require('express')
const authRouter = require('./routes/auth.routes')
const mongoose = require('mongoose');


const app = express()

app.use(express.json())

app.use('/api/users', authRouter)

app.get('/', async (req, res) => {
  try {
    res.json({ message: 'Hello, world!' })
  } catch (error) {
    console.error('Error executing query', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

mongoose.connect(process.env.MONGODB_HOST);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
});

