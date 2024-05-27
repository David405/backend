const express = require('express')
const messageController = require('../controllers/messageController')
const { verifyToken, restrictTo } = require('./../middleware/auth.middleware')

const router = express.Router({ mergeParams: true })

router.use(verifyToken) // this will protect all the middlewares below from users that are not logged in
router.use(restrictTo('Applicant', 'Employer')) // this will protect all the middlewares below from users that are "Applicants"

router
  .route('/')
  .post(messageController.createMessage)
  .get(messageController.getAllMessages)

router
  .route('/:id')
  .patch(messageController.editMessage)
  .delete(messageController.deleteMessage)

module.exports = router
