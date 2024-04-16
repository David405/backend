const express = require('express')
const jobController = require('./../controllers/jobController')
const router = express.Router()

router.route('/').post(jobController.createJob)
router
  .route('/:id')
  .get(jobController.getJob)
  .patch(jobController.updateJob)
  .delete(jobController.deleteJob)

module.exports = router
