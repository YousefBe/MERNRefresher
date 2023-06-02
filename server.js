const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

dotenv.config({
    path: './config.env'
})
const  DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
).replace('<USERNAME>', process.env.DATABASE_NAME)



mongoose.connect(DB).then((con)=>{
})
const port = 3000;
app.listen(port, () => {
  console.log(`listening on port : ${  port}`);
});
