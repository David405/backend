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
