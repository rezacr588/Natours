const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./UserModel');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'The name must be exist!'],
      unique: true,
      trim: true,
      minlength: [10, 'Name must have more than 10 length'],
      maxlength: [40, 'Name must have less than 40 length'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Duration must be inputed'],
    },
    vip: {
      type: Boolean,
      default: false,
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Maxgroupsize must be inputed'],
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, hard',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    discount: {
      type: Number,
      default: 0,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount {VALUE} must be less than price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Summary is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    startDates: [Date],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startLocation: {
      // Geo Json
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        // Geo Json
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Virtual Fields

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Virtual Populates

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name);
  next();
});
tourSchema.post('save', function (doc, next) {
  next();
});
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});
tourSchema.pre(/^find/, function (next) {
  this.find({ vip: { $ne: true } });
  this.start = Date.now();
  next();
});
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Thsi operation takes ${this.start - Date.now()} miliseconds`);
  next();
});
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { vip: { $ne: true } } });
  next();
});
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
// Embedding users into tours
// tourSchema.pre('save',async function(next){
//   const guidePromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidePromises);
//   next()
// });
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
