const express = require('express');
const ReviewController = require('../controllers/ReviewController');
const AuthController = require('../controllers/AuthController');

const router = express.Router({ mergeParams : true });

router
  .route('/')
  .get(ReviewController.getAllReviews)
  .post(AuthController.protect ,AuthController.restrictTo('user')  ,ReviewController.createReview);

module.exports = router;
