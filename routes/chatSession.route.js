const express = require('express')
const chatSessionController = require('../controllers/chatSessionController')
const { verifyToken, restrictTo } = require('./../middleware/auth.middleware')

const messageRouter = require('./../routes/message.route')

const router = express.Router()

router.use(verifyToken) // this will protect all the middlewares below from users that are not logged in
router.use(restrictTo('Applicant', 'Employer')) // this will protect all the middlewares below from users that are "Applicants"

// get All messages by sessionId ROUTE
router.use('/:sessionId/messages', messageRouter)

router
  .route('/')
  .post(chatSessionController.createChatSession)
  .get(chatSessionController.getAllChatSession)

module.exports = router
