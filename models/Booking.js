const mongoose = require('mongoose');

const BookingSchema = mongoose.Schema({
    tour :{
        type: mongoose.Schema.ObjectId,
        ret : 'Tour',
        required : [true , 'Booking must  belong to a tour'],
    },
    user :{
        type: mongoose.Schema.ObjectId,
        ret : 'User',
        required : [true , 'Booking must  belong to a User'],
    },
    price :{
        type : Number,
        required : [true , 'Booking must  have  a price'],
    },
    createdAt :{
        type : Date,
        default : Date.now(),   
    },
    paid :{
        type : Boolean,
        default : true
    },
});

BookingSchema.pre(/^find/, function(next) {

    this.populate("user").populate({
        path : "tour", 
        select : "name"
    });
    next();
  });

const Booking = mongoose.model('Booking', BookingSchema);

module.exports = Booking;
