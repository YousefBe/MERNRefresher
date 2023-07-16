const express = require('express');
const AuthController = require('../controllers/AuthController');
const BookingController = require('../controllers/BookingController');

const router = express.Router({ mergeParams : true });

router
  .get('/checkout-session/:tourId', AuthController.protect , BookingController.getCheckoutSession)
 

module.exports = router;
