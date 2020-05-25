const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/UserModel');
const AppError = require('../Tools/AppError');
const catchAsync = require('../Tools/CatchAsync');
const Factory = require('./factoryHandler');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const extention = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${extention}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadSingle = upload.single('photo');

const filterObj = (obj, ...allowedFields) => {
  const newObject = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObject[el] = obj[el];
  });
  return newObject;
};

exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) GET the user
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError('This route is not for updating your password!', 400)
    );
  }

  // 2) Filter body of request
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update the user informations
  const newUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: newUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.getUser = Factory.getOne(User);
// Do not update password!
exports.patchUser = Factory.updateOne(User);
exports.deleteUser = Factory.deleteModel(User);
exports.getUsers = Factory.getAll(User);
