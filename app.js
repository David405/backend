const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({ path: './.env' })

const AppError = require('./utils/appError')
const authRouter = require('./routes/auth.routes')
const jobRouter = require('./routes/jobAd.routes')
const applicationRouter = require('./routes/application.routes')

const app = express()

app.use(cors())

app.use(express.json())

app.use('/api/users', authRouter)
app.use('/api/v1/jobs', jobRouter)
app.use('/api/v1/applications', applicationRouter)

//Handling unhandled route
app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server`, 404))
})

app.get('/', async (req, res) => {
  try {
    res.json({ message: 'Hello, world!' })
  } catch (error) {
    console.error('Error executing query', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

mongoose.connect(process.env.MONGODB_HOST)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))
db.once('open', () => {
  console.log('Connected to MongoDB')
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
})
