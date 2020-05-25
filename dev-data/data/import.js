// Connect to DB

const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');
const User = require('../../models/UserModel');
const Review = require('../../models/reviewModel');

const fs = require('fs');

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

// Read Datas

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`));

// Import Datas

const importData = async (req, res) => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Datas is imported');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Delete Datas

const deleteData = async (req, res) => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Datas is deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
