const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const UserModel = require('../models/User');
const AppError = require('../utls/appError');
const catchAsync = require('../utls/catchAsync');
const sendEmail = require('../utls/email');


const signToken = userId => {
  return jwt.sign(
    {
      id: userId
    },
    process.env.JWT_TOKEN,
    {
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  );
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires : new Date(Date.now() +  process.env.JWT_COOKIE_EXPIRES_IN * 24 *60 *60 *1000),
    secure : false ,
    httpOnly : true,
  }

  if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token ,cookieOptions)

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await UserModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirmation: req.body.passwordConfirmation
  });
  createSendToken(newUser ,201 ,res)
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('3awzen email w password', 400));
  }

  //we use select to specify the fields we need to retrieve,
  // and the plus to get the fileds that are not selected by default
  //check user model
  const user = await UserModel.findOne({ email: email }).select('+password');
  console.log(user);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('3awzen email w password', 400));
  }
  createSendToken(user ,200 ,res)

});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('You Are not Authoirzed !', 401));
  }
  console.log(process.env.JWT_TOKEN);

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_TOKEN);

  //if user deleted after token has been issued , and some one has access to the  token
  const freshUser = await UserModel.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError('token is no longer valid', 401));
  }

  console.log('here' + freshUser.changedPasswordAfter(decoded.iat));

  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password!', 401));
  }
  console.log(decoded.iat);

  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(next(new AppError('You are not allowed to do this', 403)));
    }
    next();
  };
};

exports.forggotPassword = catchAsync(async (req, res, next) => {
  const user = await UserModel.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('no user found with this email'));
  }

  const resetToken = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot password ? No problem , we got you here is a link to reset your password but try to remember it next time matkol4 dm8na ${resetUrl}`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset',
      text : message
    });

    res.status(200).json({
      status: 'success',
      message: 'token sent'
    });
  } catch (error) {
    user.passwordResetToken =undefined;
    user.passwordRestExpiresAt =undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Something went wrong , we could not reset your password'))
  }
});

exports.resetPasswrod =  async (req, res, next) => {
console.log(req.params.token);
  const hashedToken = crypto
  .createHash('sha256')
  .update(req.params.token)
  .digest('hex');

  const user = await UserModel.findOne({ passwordResetToken : hashedToken   });
  if (!user) {
    return next(new AppError('no user found with this email',400));
  }

  user.password = req.body.password;
  user.passwordConfirmation = req.body.passwordConfirmation;
  user.passwordResetToken = undefined
  user.passwordRestExpiresAt = undefined

  await user.save();
  createSendToken(user ,200 ,res)
};
 

exports.updatePassword = catchAsync(async (req, res, next) => {
  //req.user.id comes from the protect middleware in the route
  const user = await UserModel.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('wrong password', 401));
  }

  //schema pre save will run and hash the password , 
  //and will vlaidate the password confirmation
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm; 

  await user.save();
  createSendToken(user, 200, res);
});
