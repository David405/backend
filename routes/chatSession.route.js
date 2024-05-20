const express = require('express')
const chatsessionController = require('../controllers/chatsessionController')
const { verifyToken } = require('./../middleware/auth.middleware')

const router = express.Router()

router.route('/').post(verifyToken, chatsessionController.createChatSession)

module.exports = router
