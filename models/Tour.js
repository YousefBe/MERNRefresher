const mongoose = require('mongoose');
const { default: slugify } = require('slugify');

const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour Most have a Name'],
      unique: true
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
      required: [true, 'A tour Most have a difficulty']
    },
    ratingsAvaerage: {
      type: Number,
      default: 4
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour Most have a Price']
    },
    priceDsicount: Number,
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
    }
  },
  {
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
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
  console.log('we can have more than one document middleware');
  next();
});

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

tourSchema.post(/^find /, function(docs, next) {
  console.log(docs);
  console.log(`quert took ${Date.now() - this.start} milliseconds`);
  next();
});


//aggregate middleware
// to match find and findOne
tourSchema.pre("aggregate", function(next) {
  this.pipeline().unshift({ $match : { secretTour : { $ne : true}}})
  next();
});


const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
