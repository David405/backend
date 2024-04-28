const express = require('express')
const applicationController = require('../controllers/applicantController')
const router = express.Router({ mergeParams: true })

router
  .route('/')
  .post(applicationController.createApplicant)
  .get(applicationController.getAllApplicants)
router
  .route('/:id')
  .get(applicationController.getApplicant)
  .patch(applicationController.updateApplicant)
  .delete(applicationController.deleteApplicant)

module.exports = router
