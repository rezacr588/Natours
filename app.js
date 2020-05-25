const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');

const viewsRouter = require('./routes/viewsRoutes');
const usersRouter = require('./routes/usersRoutes');
const toursRouter = require('./routes/toursRoutes');
const reviewsRouter = require('./routes/reviewsRoutes');
const AppError = require('./Tools/AppError');
const SendErr = require('./controllers/errorController');
// Mahmood
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Global Middlewares
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Http Header Secuarity
app.use(helmet());

// Body purser, reading data from body into req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate Limitter
const limitter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use('/api', limitter);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

//Prevent Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Test Middleware
app.use((req, res, next) => {
  req.now = new Date().toISOString();
  next();
});

// Routes implementations
app.use('/', viewsRouter);
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewsRouter);

// Undefined Routes
app.all('*', (req, res, next) => {
  next(
    new AppError(`the address ${req.originalUrl} is not found on server`, 404)
  );
});
app.use(SendErr);

module.exports = app;
