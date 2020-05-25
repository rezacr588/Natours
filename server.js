const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log(err);
  process.exit(1);
});
dotenv.config({
  path: './config.env',
});
const db = process.env.REMOTE_DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Database is connected!');
  });

const app = require('./app');

const server = app.listen(process.env.PORT);
process.on('unhandledRejection', (err) => {
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
