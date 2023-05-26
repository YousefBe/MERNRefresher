const express = require('express');
const morgan = require('morgan');

const app = express();

const toursRoutes = require('./routes/tours');
const usersRoutes = require('./routes/users');
//we need to add this to use express middlewares

const BASE_URL = '/api/v1';

app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
app.use(express.static(`${__dirname}/public`));



app.use((req, res, next) => {
  req.timeStamp = new Date().toISOString();
  next();
});

app.use(`${BASE_URL}/tours`, toursRoutes);
app.use(`${BASE_URL}/users`, usersRoutes);

module.exports = app;
