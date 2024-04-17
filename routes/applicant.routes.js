const express = require('express')
const applicationController = require('../controllers/applicantController')
const router = express.Router()

router.route('/').post(applicationController.createApplicant)

module.exports = router
