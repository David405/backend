const express = require('express')
const messageController = require('../controllers/messageController')
const { verifyToken } = require('./../middleware/auth.middleware')

const router = express.Router({ mergeParams: true })

router
  .route('/')
  .post(verifyToken, messageController.createMessage)
  .get(verifyToken, messageController.getAllMessages)

router
  .route('/:id')
  .patch(verifyToken, messageController.editMessage)
  .delete(verifyToken, messageController.deleteMessage)

module.exports = router
