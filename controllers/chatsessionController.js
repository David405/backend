const ChatSession = require('../models/chatSession')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const mongoose = require('mongoose')

exports.createChatSession = catchAsync(async (req, res, next) => {
  const { users } = req.body
  if (users.length !== 2)
    return next(
      new AppError('A chat session must include exactly two users.', 400),
    )

  const newChatSession = await ChatSession.create(req.body)
  res.status(201).json({
    status: 'success',
    data: {
      ChatSession: newChatSession,
    },
  })
});

exports.getAllChatSession = catchAsync(async (req, res, next) => {
  const userId = mongoose.Types.ObjectId(req.user.id)

  const chatSessions = await ChatSession.find({ users: userId }).populate({
    path: 'users',
    select: 'email photo first_name last_name phone_number is_employer _id',
  })

  res.status(200).json({
    count: chatSessions.length,
    status: 'success',
    data: {
      chatSessions,
    },
  })
});
