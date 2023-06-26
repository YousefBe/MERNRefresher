const express = require('express');

const router = express.Router();
const ToursController = require('../controllers/ToursControlleer');
const AuthController = require('../controllers/AuthController');

// app.get('/api/v1/tours', ToursController.getTours)
// app.post('/api/v1/tours' , ToursController.addTour)

// app.get('/api/v1/tours/:id' , ToursController.getTour)
//put expects the entire updated object , while patch expects only the params being updated but you can still use any of them.
// app.patch('/api/v1/tours/:id' , ToursController.updateTour)
// app.delete('/api/v1/tours/:id' , ToursController.deleteTour)

router.route('/').get(AuthController.protect ,ToursController.getTours).post(AuthController.protect ,ToursController.addTour);
router.route('/best-five-tours').get(ToursController.getBestTours ,ToursController.getTours);
router.route('/stats').get( ToursController.getTourStats);
router.route('/monthly-plan/:year').get( ToursController.getMonthlyPlan);

// router.param('id',ToursController.checkId);

router
  .route('/:id')
  .get(AuthController.protect ,ToursController.getTour)
  .patch(ToursController.updateTour)
  .delete(AuthController.protect , AuthController.restrictTo('admin','guide') ,ToursController.deleteTour);

router.param('id', (req, res, next, val) => {
  console.log('tryin to find a tour with param :', val);
  next();
});

module.exports = router;
