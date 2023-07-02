const express = require('express');
const morgan = require('morgan');
const rateLimit =require('express-rate-limit');
const helmet  = require('helmet')
const mongoSanitize  = require('express-mongo-sanitize')

//bt7wl el html code w el 7agat d abl ma tt7t fl db
const xss = require('xss-clean')
const hpp = require('hpp')

const app = express();
const toursRoutes = require('./routes/tours');
const usersRoutes = require('./routes/users');
const reviewRoutes = require('./routes/review');
const AppError = require('./utls/appError');
const ErrorController = require('./controllers/ErrorController');
const User = require('./models/User');
//we need to add this to use express middlewares

const BASE_URL = '/api/v1';

//d ely bt7ot el data f req.body 
app.use(express.json({
  limit: '10kb'
}));

//data senitization against NoSql query injection
app.use(mongoSanitize());
app.use(xss());

//prevent parameter pollution
// whitelist array allows parameter to be duplicated
app.use(hpp({
  whitelist : ['duration']
}));




// parse application/x-www-form-urlencoded, basically can only parse incoming Request Object if strings or arrays
app.use(express.urlencoded({ extended: false }));if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

//security http headers
//4ofha f postman
app.use(helmet());

const limiter = rateLimit({
  max :100 ,
  windowMs : 60 * 60 * 1000,
  message : 'Rate limit exceeded'
})


app.use(express.static(`${__dirname}/public`));
app.use('/api', limiter)


app.use(async (req, res, next) => {
  req.timeStamp = new Date().toISOString();
  next();
});

app.use(`${BASE_URL}/tours`, toursRoutes);
app.use(`${BASE_URL}/users`, usersRoutes);
app.use(`${BASE_URL}/reviews`, reviewRoutes);

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
