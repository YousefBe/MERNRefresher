const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchenae = mongoose.Schema({
    name : {
        type : String,
        required : [true, 'Please enter a name'],
    },
    email:{
        type : String,
        required : [true, 'Please enter an Email Address'],
        unique : true,
        lowercase : true,
        validate : [validator.isEmail , 'Please enter a Valid Email Address']
    },
    photo : String,
    password : {
        type : String,
        required : [true, 'Please enter a Password'],
        minlength:8,
        select:false
    },
    passwordConfirmation : {
        type : String,
        required : [true, 'Please Confirm Password'],
        validate :{
            validator : function(value) {
                return value === this.password 
            }
        }
    },
})

userSchenae.pre('save', async function(next){
    if(!this.isModified("password")){
        return next();
    }
    this.password =await bcrypt.hash(this.password , 12)

    this.passwordConfirmation = undefined
    next()
})


userSchenae.methods.correctPassword = async function(requestPassword , userPassword){ 
    const correct = await bcrypt.compare(requestPassword, userPassword);
    return correct;
}



const User = mongoose.model('User' , userSchenae)

module.exports = User;
