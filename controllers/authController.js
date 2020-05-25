const jwt = require('jsonwebtoken');
const utils = require('util');
const crypto = require('crypto');
const User = require('../models/UserModel');
const catchAsync = require('../Tools/CatchAsync');
const AppError = require('../Tools/AppError');
const Email = require('../Tools/sendMailer');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const sendTokenViaResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });
  const url = 0;
  await new Email(newUser, url).sendWelcome();
  sendTokenViaResponse(newUser, 201, res);
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError('email or password are not existed!', 400));
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('The email or password Invalid!', 401));
  sendTokenViaResponse(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) return next(new AppError('You are not logged in!', 401));
  // 2) Verification token
  const jwtDecodedData = await utils.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  // 3) Check if user is exist
  const freshUser = await User.findById(jwtDecodedData.id);
  if (!freshUser) {
    return next(
      new AppError('The User belonging to this token is not exist!', 401)
    );
  }
  // 4) Check the user changing his password after the token issued
  if (freshUser.changedPassword(jwtDecodedData.iat)) {
    return next(new AppError('User reacently changed password!', 401));
  }
  req.user = freshUser;
  next();
});

exports.loggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    // 1) Verification token
    const jwtDecodedData = await utils.promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    // 2) Check if user is exist
    const freshUser = await User.findById(jwtDecodedData.id);
    if (!freshUser) {
      return next();
    }
    // 3) Check the user changing his password after the token issued
    if (freshUser.changedPassword(jwtDecodedData.iat)) {
      return next();
    }
    res.locals.user = freshUser;
    return next();
  }
  next();
});

exports.restrict = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('This user does not have permission to this route')
      );
    }
    next();
  };
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get The User
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address.', 404));
  }
  // Generate Reset Password
  const resetToken = user.createForgotPassword();
  await user.save({ validateBeforeSave: false });

  // Send it to the user's Email address

  try {
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetUrl).sendResetPassword();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenAt = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenAt: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) return next(new AppError('Token is expired or invalid', 400));
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenAt = undefined;
  await user.save();
  // 3) Update changedPasswordAt property for the current user
  // 4) Log the user in, send JWT
  sendTokenViaResponse(user, 200, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) GET user from collection
  const user = await User.findById(req.user.id).select('+password');
  // 2) Check is POSTed current password is currect
  if (!(await user.correctPassword(req.body.currentPassword, user.password)))
    return next(new AppError('Your current password is wrong'));
  // 3) IS so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work currectly
  // 4) Log user in, send JWT
  sendTokenViaResponse(user, 200, res);
});
