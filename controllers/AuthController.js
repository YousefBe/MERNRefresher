const UserModel = require('../models/User');
const AppError = require('../utls/appError');
const catchAsync = require('../utls/catchAsync');
const jwt = require('jsonwebtoken');

const signToken = (userId)=>{
  return jwt.sign({
    id : userId,
  } , process.env.JWT_TOKEN , {
    expiresIn : process.env.JWT_EXPIRES_IN
  })
}

exports.signup =catchAsync(async (req, res, next) => {
  const newUser = await UserModel.create({
    name : req.body.name , 
    email : req.body.email , 
    password : req.body.password, 
    passwordConfirmation : req.body.passwordConfirmation
  });

  const token = signToken(newUser._id)

  return res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

exports.login = catchAsync(async (req , res ,next )=>{
  const {email , password } = req.body;

  if (!email || !password) { 
   return next(new AppError("3awzen email w password" , 400))
  }

  //we use select to specify the fields we need to retrieve, 
  // and the plus to get the fileds that are not selected by default 
  //check user model 
  const user = await UserModel.findOne({ email : email }).select("+password")
  console.log(user.correctPassword(password , user.password));

  if (!user || ! (await user.correctPassword(password , user.password))) { 
    return next(new AppError("3awzen email w password" , 400))
   }
  const token = signToken(user._id)

  return res.status(200).json({
    status:'sccess',
    token
  })

})