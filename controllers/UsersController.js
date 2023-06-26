const User = require("../models/User");
const AppError = require("../utls/appError");
const catchAsync = require("../utls/catchAsync")

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
  };
  
exports.getUsers = catchAsync( async(req, res , next)=>{
    const users = await User.find()

    return res.status(200).json({
        status: 'success',
        results : users.length,
        data: {
            users
        }
    })
})

exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'mafee4 passwordat hnaa laa',
          400
        )
      );
    }
  
    //bn4eel ay 7aga 8er el email w el name
    const filteredBody = filterObj(req.body, 'name', 'email');
  
    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        //true d 34an t return el new document
      new: true,
      runValidators: true
    });
  
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  });

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id , {active : false })

    res.status(204).json({
        status:'success',
        data : null
    });
})


exports.addUser = ()=>{}
exports.getUser = ()=>{}
exports.updateUser = ()=>{}
exports.deleteUser = ()=>{}