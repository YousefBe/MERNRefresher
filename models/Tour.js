const mongoose = require('mongoose');
const { default: slugify } = require('slugify');
const User = require('./User');

const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour Most have a Name'],
      unique: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour Most have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour Most have a max size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour Most have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }

    },
    ratingsAvaerage: {
      type: Number,
      default: 4,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set : value => Math.round( value * 10 ) / 10, // 2.888 -> 28.88 -> 29 / 10 -> 2.9
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour Most have a Price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour Most have a sunnary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour Most have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date], 
    secretTour :{
      type : Boolean,
      default: false
    },
    startLocation:{
      type: {
        type : String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates:[Number ] ,
      address:String,
      description:String
    },
    locations :[
      {
        type :{
          type : String,
          default: 'Point',
          enum : ['Point']
        },
        coordinates:[Number ] ,
        address:String,
        description:String,
        day : Number,
      }
    ],
    guides:[
      {
        type: mongoose.Schema.ObjectId,
        ref : 'User'
      }
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

//doc middleware runs before .save and .create

// THIS REFERS TO CURRENT DOC

tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre('save', function(next) {
  next();
});

// tourSchema.pre('save', async function(next) {
//  const userrr = await User.find({name : "Kate Morrison"});
//  console.log(userrr);
//   const guidesPromises = this.guides.map(async (id)=> await User.findById(id));
//   this.guides = await Promise.all(guidesPromises)
//   console.log(this.guides);
//   next();
// });


tourSchema.post('save', function(doc, next) {
  console.log(doc);
  next();
});


//query middleware

// THIS REFERS TO CURRENT QUERY

// to match find and findOne
tourSchema.pre(/^find / , function(next) {
  //since it is a find query , we can chain another find query
  this.find({ secretTour : { $ne : true}})
  this.start = Date.now();
  next();
});


//VIRTRUAL POPULATE
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });

  next();
});

tourSchema.index({ price : 1 ,ratingsAvaerage : -1});
tourSchema.index({ slug : 1});
tourSchema.index({ startLocation : '2dsphere'})


tourSchema.post(/^find /, function(docs, next) {
  console.log(docs);
  console.log(`quert took ${Date.now() - this.start} milliseconds`);
  next();
});


//aggregate middleware
// // to match find and findOne
// tourSchema.pre("aggregate", function(next) {
//   this.pipeline().unshift({ $match : { secretTour : { $ne : true}}})
//   next();
// });


const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
