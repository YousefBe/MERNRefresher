const express = require('express');
const morgan = require('morgan');

const app = express();
const toursRoutes = require('./routes/tours');
const usersRoutes = require('./routes/users');
const AppError = require('./utls/appError');
const ErrorController = require('./controllers/ErrorController');
//we need to add this to use express middlewares

const BASE_URL = '/api/v1';

app.use(express.json());
// parse application/x-www-form-urlencoded, basically can only parse incoming Request Object if strings or arrays
app.use(express.urlencoded({ extended: false }));if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
app.use(express.static(`${__dirname}/public`));



app.use((req, res, next) => {
  req.timeStamp = new Date().toISOString();
  next();
});

app.use(`${BASE_URL}/tours`, toursRoutes);
app.use(`${BASE_URL}/users`, usersRoutes);

app.all('*' , (req, res, next) => {
  // res.status(404).json({
  //   status : 'Failed',
  //   message : `can not find ${req.originalUrl} on thins server!`
  // })
  // const error = new Error(`can not find ${req.originalUrl} on thinswwww server!`)
  // error.status = 'Failed';
  // error.statusCode = 404;

  //next always assumes that the parameter passed is an error and sends the request to the error handler middleware
  next(new AppError(`can not find ${req.originalUrl} on this server!` , 404))
})

//if we gave it 4 params , express will know that its an error handling middleware
app.use(ErrorController)

module.exports = app;
