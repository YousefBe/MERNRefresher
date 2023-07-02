const crypto = require('crypto');
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
    role:{
        type : String,
        enum:['admin', 'moderator', 'guide','user'],
        default: 'user',
    },
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
    passwordChangedAt: Date, 
    passwordResetToken: String,
    passwordRestExpiresAt: Date,
    active:{
        type : Boolean,
        default : true ,
        select: false
    }
})

userSchenae.pre('save', async function(next){
    if(!this.isModified("password")){
        return next();
    }
    this.password =await bcrypt.hash(this.password , 12)

    this.passwordConfirmation = undefined
    next()
})

userSchenae.pre(/^find/, async function(next){
    this.find({active: {$ne : false }})
    next()
});


userSchenae.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();
    //34an lw 7asl delay fl save
    this.passwordChangedAt = Date.now() - 1000;
    next();
  });
  

userSchenae.methods.correctPassword = async function(requestPassword , userPassword){ 
    const correct = await bcrypt.compare(requestPassword, userPassword);
    return correct;
}

userSchenae.methods.changedPasswordAfter = function(JWTTimeStamp){ 
    console.log(this.passwordChangedAt);
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000 , 10)
        console.log(changedTimeStamp);
        // password changed after token was issued
        return JWTTimeStamp < changedTimeStamp 
    }

    // false means no change
    return false;
}

userSchenae.methods.createPasswordResetToken= function(){
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken =crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordRestExpiresAt = Date.now()+10 *60* 1000;
    return resetToken
}



const User = mongoose.model('User' , userSchenae)

module.exports = User;
