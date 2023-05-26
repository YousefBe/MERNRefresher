const express = require('express');
const router = express.Router();
const ToursController = require('../controllers/ToursControlleer');

// app.get('/api/v1/tours', ToursController.getTours)
// app.post('/api/v1/tours' , ToursController.addTour)

// app.get('/api/v1/tours/:id' , ToursController.getTour)
//put expects the entire updated object , while patch expects only the params being updated but you can still use any of them.
// app.patch('/api/v1/tours/:id' , ToursController.updateTour)
// app.delete('/api/v1/tours/:id' , ToursController.deleteTour)

router.route('/').get(ToursController.getTours).post(ToursController.addTour);

router
  .route('/:id')
  .get(ToursController.getTour)
  .patch(ToursController.updateTour)
  .delete(ToursController.deleteTour);

router.param('id', (req, res, next, val) => {
  console.log('tryin to find a tour with param :', val);
  next();
});

module.exports = router;
