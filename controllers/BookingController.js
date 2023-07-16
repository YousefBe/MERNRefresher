const Booking = require("../models/Booking");
const Tour = require("../models/Tour");
const catchAsync = require("../utls/catchAsync");
const stripe = require('stripe')("sk_test_51LK6v7DFP1Pnq0kKhNgHEUG0eGUYVaDHjPVGTYiTAG8JIlqsACM5oigV5HCdx0FeopJLpXkFgRAVd9iLlMQIc10B00ps1Kzsy5");

exports.getCheckoutSession = catchAsync(async(req,res,next)=>{
    const tour = await Tour.findById(req.params.tourId);
    
    const session  = await stripe.checkout.sessions.create({
        payment_method_types : ['card'] , 
        success_url : `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}` , 
        cancel_url :`${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email : req.user.email,
        client_reference_id : req.params.tourId,
        line_items :[
            {
                name : `${tour.name } Tour`,
                description : tour.summary , 
                images : [],
                amount: tour.price * 100 ,
                currency : 'usd',
                quantity :1
            }
        ]
    })

    return res.json({
        status : 200 , 
        data :{
            tour : tour,
            session
        }
    });
})


exports.createBookingCheckout = catchAsync(async(req , res ,next)=>{
    const {tour , user , price} = req.query;
    if (!tour && !user && !price) {
        return next();
    }
    await Booking.create({tour , price, user});
    res.redirect(req.originalUrl.split('?')[0]);
})