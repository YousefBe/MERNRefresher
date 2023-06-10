const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION!');
  console.log(err.name, err.message);
  process.exit(1);
});


const app = require('./app');

dotenv.config({
  path: './config.env'
});
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
).replace('<USERNAME>', process.env.DATABASE_NAME);

mongoose.connect(DB).then(con => {
  console.log('Connected to database');
});
const port = 3000;
const server = app.listen(port, () => {
  console.log(`listening on port : ${port}`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION!  ');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
