const mongoose = require('mongoose');

const tourSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour Most have a Name'],
    unique: true
  },
  price: {
    type: Number,
    required: [true, 'A tour Most have a Price']
  },
  rating: {
    type: Number,
    default: 4
  }
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
