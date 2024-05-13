const express = require('express')
const jobController = require('../controllers/jobController')

const applicationRouter = require('./application.routes')
const verifyToken = require('../middleware/auth.middleware')
const authController = require('./../controllers/auth.controller')
const router = express.Router()

// router.use(verifyToken) // this will protect all the middlewares under it from users that are not logged in

router.route('/get-total-job-count').get(jobController.getTotalJobs)
router.route('/get-total-job-type').get(jobController.getTotalJobsTypes)

router.use('/:jobId/applications', applicationRouter)

router.route('/').post(jobController.createJob).get(jobController.getAllJobs)
router
  .route('/:id')
  .get(jobController.getJob)
  .patch(jobController.updateJob)
  .delete(jobController.deleteJob)

router.get('/get-employer-jobs/:employerId', jobController.getJobByEmployer)

module.exports = router
