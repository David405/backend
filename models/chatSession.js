const mongoose = require('mongoose')

const chatSessionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      maxlength: [15, 'A tour name must have less or equal to 15 characters'],
      minlength: [10, 'A tour name must have more or equal to 10 characters'],
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
