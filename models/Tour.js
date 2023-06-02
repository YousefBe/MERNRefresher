const mongoose = require('mongoose');

const tourSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour Most have a Name'],
    unique: true
  },
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
    select : false,
  },
  startDates: [Date]
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
