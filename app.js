const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({ path: './.env' })

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const authRouter = require('./routes/auth.routes')
const jobRouter = require('./routes/jobAd.routes')
const applicationRouter = require('./routes/application.routes')
const messageRouter = require('./routes/message.route')
const chatSessionRouter = require('./routes/chatSession.route')

const app = express()

// global middleware
if ((process.env.NODE_ENV = 'development')) {
  app.use(morgan('dev'))
}

app.use(cors())

app.use(express.json())

app.use('/api/users', authRouter)
app.use('/api/v1/jobs', jobRouter)
app.use('/api/v1/applications', applicationRouter)
// app.use('/api/v1/messages', messageRouter)
app.use('/api/v1/chatsessions', chatSessionRouter)

//Handling unhandled route
app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server`, 404))
})

// global error handling
app.use(globalErrorHandler)

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
})

const PORT = process.env.PORT || 3000
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

const io = require('socket.io')(server)
