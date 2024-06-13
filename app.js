const { promisify } = require('util') //builtin function for promifying token verification
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const http = require('http')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

const catchAsync = require('./utils/catchAsync')
const AppError = require('./utils/appError')

const globalErrorHandler = require('./controllers/errorController')
require('./models/message')
require('./models/chatSession')
require('./models/user')

const authRouter = require('./routes/auth.routes')
const jobRouter = require('./routes/jobAd.routes')
const applicationRouter = require('./routes/application.routes')
const messageRouter = require('./routes/message.route')
const chatSessionRouter = require('./routes/chatSession.route')
const chatEvents = require('./utils/chatEvents')

dotenv.config({ path: './.env' })

const jwt = require('jsonwebtoken')
const { Server } = require('socket.io')

const JWT_SECRET = process.env.SECRET_KEY

const app = express()

const server = http.createServer(app)

// global middleware
if ((process.env.NODE_ENV = 'development')) {
  app.use(morgan('dev'))
}

app.use(express.json())
app.use(cors())

app.use('/api/users', authRouter)
app.use('/api/v1/jobs', jobRouter)
app.use('/api/v1/applications', applicationRouter)
app.use('/api/v1/messages', messageRouter)
app.use('/api/v1/chatSessions', chatSessionRouter)

app.get('/', async (req, res) => {
  try {
    res.json({ message: 'Hello, world!' })
  } catch (error) {
    console.error('Error executing query', error)
    res.status(500).json({ message: `Internal server error: ${error}` })
  }
})
//Handling unhandled route
// app.all('*', (req, res, next) => {
//   next(new AppError(`Cant find ${req.originalUrl} on this server`, 404))
// })

// global error handling
app.use(globalErrorHandler)

//Handling unhandled route
// app.all('*', (req, res, next) => {
//   next(new AppError(`Cant find ${req.originalUrl} on this server`, 404))
// })

// global error handling
app.use(globalErrorHandler)

mongoose.connect(process.env.MONGODB_HOST)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))
db.once('open', () => {
  console.log('Connected to MongoDB')
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})

const Message = mongoose.model('Message')
const User = mongoose.model('User')

//authenticating socket.io user
io.use(
  catchAsync(async (socket, next) => {
    const namespace = socket.nsp
    console.log(namespace)
    if (namespace === '/authenticated') {
      const token = socket.handshake.query.token
      const decoded = await promisify(jwt.verify)(token, JWT_SECRET)
      const currentUser = await User.findById(decoded['$__']._id)
      if (!currentUser) {
        return next(
          new AppError(
            'The User belonging to this token does not exist anylonger',
            401,
          ),
        )
      }
      // GRANT ACCESS TO PROTECTED ROUTE
      socket.userId = currentUser
    }
    next()
  }),
)

io.on(chatEvents.connection, (socket) => {
  console.log('connection' + socket.userId)

  socket.on(chatEvents.disconnection, (socket) => {
    console.log('disconnected' + socket.userId)
  })

  socket.on(chatEvents.joinSession, ({ chatSessionId }) => {
    socket.join(chatSessionId)
    console.log('A user joined chatsession:' + chatSessionId)
  })

  socket.on(chatEvents.leaveSession, ({ chatSessionId }) => {
    socket.join(chatSessionId)
    console.log('A user left chatSession:' + chatSessionId)
  })

  socket.on(
    chatEvents.chatSessionMessage,
    async ({ chatSessionId, message }) => {
      if (message.trim().length > 0) {
        const user = await User.findOne({ _id: socket.userId })
        const newMessage = new Message({
          chatSession: chatSessionId,
          user: socket.userId,
          message,
        })
        io.to(chatSessionId).emit(chatEvents.newMessage, {
          message,
          name: user.name,
          userId: socket.userId,
        })
        await newMessage.save()
      }
    },
  )
})
