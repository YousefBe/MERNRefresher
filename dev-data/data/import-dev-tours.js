const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const TourModel = require('../../models/Tour');
const User = require('../../models/User');
const Review = require('../../models/Review');

dotenv.config({
    path: '../../config.env'
})
const toursData = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'utf8')
);
const reviewsData = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf8')
);
const usersData = JSON.parse(
  fs.readFileSync(`${__dirname}/users.json`, 'utf8')
);
const DB =process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
).replace('<USERNAME>', process.env.DATABASE_NAME);

mongoose.connect(DB).then(() => {});

const importData = async () => {
  try {
  await TourModel.create(toursData);
  await User.create(usersData , { validateBeforeSave : false });
  await Review.create(reviewsData);

  } catch (error) {
    console.log(error);
  }
  process.exit();

};

const deleteAllTours = async () => {
  try {
    await TourModel.deleteMany();
    await Review.deleteMany();
    await User.deleteMany();
  } catch (error) {
    console.log(error);
  }
  process.exit();

};

console.log(process.argv);
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  console.log("🚀 ~ file: import-dev-tours.js:54 ~ --delete:")
  deleteAllTours();
}
