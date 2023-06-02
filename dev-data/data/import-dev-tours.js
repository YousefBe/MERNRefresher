const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const TourModel = require('../../models/Tour');

dotenv.config({
    path: './config.env'
})
const toursData = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf8')
);
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
).replace('<USERNAME>', process.env.DATABASE_NAME);

mongoose.connect(DB).then(() => {});

const importData = async () => {
  try {
  await TourModel.create(toursData);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

const deleteAllTours = async () => {
  try {
    await TourModel.deleteMany();
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

console.log(process.argv);
if (process.argv[2] === '--import') {
  importData();
  console.log("🚀 ~ file: import-dev-tours.js:40 ~ importData:", importData)

} else if (process.argv[2] === '--delete') {
  deleteAllTours();
  console.log("🚀 ~ file: import-dev-tours.js:41 ~ deleteAllTours:", deleteAllTours)

}
