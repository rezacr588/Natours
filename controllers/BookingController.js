const Booking = require('../models/BookingModel');
const Factory = require('./factoryHandler');

exports.create = Factory.createOne(Booking);
exports.index = Factory.getAll(Booking);
exports.delete = Factory.deleteModel(Booking);
exports.update = Factory.updateOne(Booking);
exports.get = Factory.getOne(Booking);
