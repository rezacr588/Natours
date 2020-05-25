const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewsRoutes');

const router = express.Router();
router.use('/:tourId/reviews', reviewRouter);
router
  .route('/monthPlan/:year')
  .get(
    authController.protect,
    authController.restrict('admin', 'lead-guide', 'guide'),
    tourController.getMounthlyPlan
  );
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
router
  .route('/top5cheap')
  .get(tourController.topFiveCheap, tourController.index);
router.route('/states').get(tourController.getStates);
router
  .route('/')
  .get(tourController.index)
  .post(
    authController.protect,
    authController.restrict('admin', 'lead-guide'),
    tourController.create
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrict('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.patchTour
  )
  .delete(
    authController.protect,
    authController.restrict('lead-guide', 'admin'),
    tourController.deleteTour
  );

module.exports = router;
