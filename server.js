const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');
const Tour = require('./models/Tour');

dotenv.config({
    path: './config.env'
})
const  DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
).replace('<USERNAME>', process.env.DATABASE_NAME)

const newTour = new Tour({
  name : 'Tour To Alexanderia',
  price : 400,
  rate : 2,
});

newTour.save().then(res => console.log(res));


mongoose.connect(DB).then((con)=>{
  console.log(con.connections);
})
const port = 3000;
app.listen(port, () => {
  console.log(`listening on port : ${  port}`);
});
