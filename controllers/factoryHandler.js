const Catch = require('../Tools/CatchAsync');
const AppError = require('../Tools/AppError');
const ApiTool = require('../Tools/apiFeutures');

exports.deleteModel = (Model) =>
  Catch(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('The Document not found', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
exports.createOne = (Model) =>
  Catch(async (req, res, next) => {
    const document = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        document,
      },
    });
  });
exports.updateOne = (Model) =>
  Catch(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!document) {
      return next(new AppError('The document not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        document,
      },
    });
  });
exports.getOne = (Model, populateOps) =>
  Catch(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOps) query = query.populate(populateOps);
    const document = await query;
    if (!document) {
      return next(new AppError('The document not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        document,
      },
    });
  });
exports.getAll = (Model) =>
  Catch(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const utils = new ApiTool(Model.find(filter), req.query)
      .filter()
      .sort()
      .poject()
      .pagination();
    const Documents = await utils.query;
    res.status(200).json({
      status: 'success',
      counts: Documents.length,
      data: { Documents },
    });
  });
