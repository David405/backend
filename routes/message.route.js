const express = require('express')
const chatsessionController = require('../controllers/chatsessionController')
const { verifyToken } = require('./../middleware/auth.middleware')

const router = express.Router({ mergeParams: true })
module.exports = router
