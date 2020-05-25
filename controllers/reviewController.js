const Review = require('../models/reviewModel');
const Catch = require('../Tools/CatchAsync');
const Factory = require('./factoryHandler');

exports.setTourandUserID = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.createReview = Factory.createOne(Review);
exports.getAllReviews = Factory.getAll(Review);
exports.deleteReview = Factory.deleteModel(Review);
exports.updateReview = Factory.updateOne(Review);
exports.getReview = Factory.getOne(Review);
