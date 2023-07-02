const mongoose = require('mongoose');
const Tour = require('./Tour');

const ReviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review Cannot be empty']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review Must Belong to a Tour!']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review Must Belong to a User!']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

ReviewSchema.pre(/^find/, function(next) {
  //   this.populate({
  //     path: 'tour',
  //     select: 'name'
  //   }).populate({
  //     path: 'user',
  //     select: 'name photo'
  //   });
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});
ReviewSchema.statics.calcAverageRatings = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',

        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  console.log(
    '🚀 ~ file: Review.js:61 ~ ReviewSchema.statics.calcAverageRatings=function ~ stats:',
    stats
  );
 if (stats.length > 0) {
  await Tour.findByIdAndUpdate(tourId, {
    ratingsAvaerage: stats[0].avgRating,
    ratingsQuantity: stats[0].nRating
  });
 }else{
  await Tour.findByIdAndUpdate(tourId, {
    ratingsAvaerage: 4.5,
    ratingsQuantity: 0
  });
 }
};

//POST MIDDLE WARE HAS NO NEXT FUNCTION
ReviewSchema.post('save', function() {
  this.constructor.calcAverageRatings(this.tour);
});

//basy ll post
ReviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  next();
});
ReviewSchema.post(/^findOneAnd/, async function(next) {
 await this.r.constructor.calcAverageRatings(this.r.tour);
});


ReviewSchema.index({tour :1 , user : 1} , { unique : true});

const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;
