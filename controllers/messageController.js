const Message = require('../models/message')
const catchAsync = require('../utils/catchAsync')
const appError = require('../utils/appError')
const redis = require('redis')
const client = redis.createClient()

// functions that will filter out fields tha we dont want to update
const filterObj = (obj, ...allowedFields) => {
  const newObj = {}
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el]
  })
  return newObj
}

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

  const page = req.query.page * 1 || 1
  const limit = req.query.limit * 1 || 50
  const skip = (page - 1) * limit

  const cacheKey = `messages:${req.params.sessionId}:${page}:${limit}`

  client.get(cacheKey, async (err, data) => {
    if (data) {
      return res.status(200).json({
        results: JSON.parse(data).length,
        status: 'success',
        data: {
          messages: JSON.parse(data),
        },
      })
    } else {
      const messages = await Message.find(filter).skip(skip).limit(limit)
      client.setEx(cacheKey, 3600, JSON.stringify(messages))
      return res.status(200).json({
        results: messages.length,
        status: 'success',
        data: {
          messages,
        },
      })
    }
  })
})

exports.deleteMessage = catchAsync(async (req, res, next) => {
  const message = await Message.findOne({
    $and: [{ user: req.user.id }, { _id: req.params.id }],
  })
  if (!message) {
    return next(new appError('No message found ', 404))
  }

  await Message.findByIdAndDelete(message.id)
  res.status(200).json({
    status: 'success',
    data: null,
  })
})

exports.editMessage = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'message')
  const message = await Message.findOne({
    $and: [{ user: req.user.id }, { _id: req.params.id }],
  })
  if (!message) {
    return next(new appError('No message found ', 404))
  }
  //   console.log(message.id)
  //   console.log(message)

  const newMessage = await Message.findByIdAndUpdate(message.id, filteredBody, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    status: 'success',
    data: {
      newMessage,
    },
  })
})
