const express = require('express')
const applicationController = require('../controllers/applicantionController')
const router = express.Router({ mergeParams: true })

router
  .route('/total-applications')
  .get(applicationController.getTotalApplications)
router
  .route('/total-applicationStatus')
  .get(applicationController.getTotalApplicationStatus)

// update applicationstatus
router
  .route('/:id/update-applicationStatus')
  .patch(applicationController.updateApplicationStatus)

router
  .route('/')
  .post(applicationController.createApplication)
  .get(applicationController.getAllApplications)
router
  .route('/:id')
  .get(applicationController.getApplication)
  .patch(applicationController.updateApplication)
  .delete(applicationController.deleteApplication)

module.exports = router
