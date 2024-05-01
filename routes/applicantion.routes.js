const express = require('express')
const applicationController = require('../controllers/applicantionController')
const router = express.Router({ mergeParams: true })

router
  .route('/total-applications')
  .get(applicationController.getTotalApplications)

router
  .route('/')
  .post(applicationController.createApplicantion)
  .get(applicationController.getAllApplicantions)
router
  .route('/:id')
  .get(applicationController.getApplicantion)
  .patch(applicationController.updateApplicantion)
  .delete(applicationController.deleteApplicantion)

module.exports = router
