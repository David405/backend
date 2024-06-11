const ChatSession = require('../models/chatSession')
const catchAsync = require('../utils/catchAsync')
const appError = require('../utils/appError')

exports.createChatSession = catchAsync(async (req, res, next) => {
  const newChatSession = await ChatSession.create(req.body)
  res.status(201).json({
    status: 'success',
    data: {
      ChatSession: newChatSession,
    },
  })
})

exports.getAllChatSession = catchAsync(async (req, res, next) => {
  const ChatSessions = await ChatSession.find().populate({
    path: 'user',
    select: 'email photo first_name last_name phone_number is_employer _id',
  })

  res.status(200).json({
    count: ChatSessions.length,
    status: 'success',
    data: {
      ChatSessions,
    },
  })
})
