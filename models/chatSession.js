const mongoose = require('mongoose')

const chatSessionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

const ChatSession = mongoose.model('ChatSession', chatSessionSchema)
module.exports = ChatSession
