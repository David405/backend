const express = require('express')
const applicationController = require('../controllers/applicationController')
const { verifyToken } = require('./../middleware/auth.middleware')

const router = express.Router({ mergeParams: true })

router
  .route('/total-applications')
  .get(applicationController.getTotalApplications)
router
  .route('/total-application-status')
  .get(applicationController.getTotalApplicationStatus)

router
  .route('/cancel-application')
  .patch(verifyToken, applicationController.cancelApplication)

// update applicationstatus
// router
//   .route('/:id/update-application')
//   .patch(applicationController.updateApplication)

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
