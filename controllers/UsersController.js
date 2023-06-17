const User = require("../models/User")
const catchAsync = require("../utls/catchAsync")

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
exports.addUser = ()=>{}
exports.getUser = ()=>{}
exports.updateUser = ()=>{}
exports.deleteUser = ()=>{}