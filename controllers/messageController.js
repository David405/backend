const Message = require('../models/message')
const catchAsync = require('../utils/catchAsync')
const appError = require('../utils/appError')

exports.createMessage = catchAsync(async (req, res, next) => {
  const newMessage = await Message.create(req.body)
  res.status(201).json({
    status: 'success',
    data: {
      message: newMessage,
    },
  })
})
exports.getAllMessages = catchAsync(async (req, res, next) => {
  let filter = {}
  if (req.params.sessionId) filter = { chatSession: req.params.sessionId }
  const messages = await Message.find(filter)

  res.status(200).json({
    results: messages.length,
    status: 'success',
    data: {
      messages,
    },
  })
})
