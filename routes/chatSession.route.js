const express = require('express')
const chatsessionController = require('../controllers/chatsessionController')

const messageRouter = require('./../routes/message.route')
const { verifyToken } = require('./../middleware/auth.middleware')

const router = express.Router()

// get All messages by sessionId ROUTE
router.use('/:ssessionId/messages', messageRouter)

router
  .route('/')
  .post(verifyToken, chatsessionController.createChatSession)
  .get(chatsessionController.getAllChatSession)

module.exports = router
