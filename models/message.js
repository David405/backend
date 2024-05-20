const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
  {
    chatSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatSession',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

const Message = mongoose.model('Message', messageSchema)
module.exports = Message
