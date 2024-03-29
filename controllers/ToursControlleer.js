const TourModel = require('../models/Tour');
const AppError = require('../utls/appError');
const catchAsync = require('../utls/catchAsync');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('not an image please upload only images!'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

// uplooad.array('images', 5);
//
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

exports.resizeImages = catchAsync(async (req, res, next) => {
  if (!req.file.imageCover || !req.file.images) return next();

  const imageFileName = `tour-${req.params.id}-${Date.now()}-cover.jpg`;

  await sharp(req.file.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${imageFileName}`);
  req.body.imageCover = imageFileName;

  req.body.images = [];

  //always map the async code to have an array of promises
  //then fire them all by awaiting Promise.all 
  //only then you can call next();
  await Promise.all(
    req.file.images.forEach(async (file, i) => {
      const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${fileName}`);
      req.body.images.push(fileName);
    })
  );

  next();
});

class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObject = { ...this.queryString };

    const qeuryLength = Object.keys(queryObject).length;

    const exludeFields = ['page', 'sort', 'limit', 'fields'];
    exludeFields.forEach(field => delete queryObject[field]);

    let queryString = JSON.stringify(queryObject);
    // console.log("🚀 ~ file: ToursControlleer.js:20 ~ ApiFeatures ~ filter ~ queryString:", queryString)
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      match => `$${match}`
    );
    // console.log("🚀 ~  after queryString:", queryString)

    if (!qeuryLength) {
      queryString = null;
    }
    this.query = this.query.find(JSON.parse(queryString));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limit() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      //the minus means exclude this field from the results
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

exports.getBestTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAvaerage,summary,difficulty';
  next();
};

exports.getTours = async (req, res) => {
  // const queryObject = {...req.query};
  // const qeuryLength = Object.keys(queryObject).length

  // const exludeFields = ["page", "sort","limit","fields"];
  // exludeFields.forEach(field =>delete queryObject[field]);

  // let queryString = JSON.stringify(queryObject);
  // queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g , match => `$${match}`);
  // if(!qeuryLength){
  //   queryString = null
  // }

  // //first : DON"T AWAIT THIS
  // let query = TourModel.find(JSON.parse(queryString));

  // if (req.query.fields) {
  //   const fields = req.query.fields.split(',').join(' ');
  //   query = query.select(fields)
  // }else{
  //   //the minus means exclude this field from the results
  //   query = query.select("-__v")
  // }

  // if (req.query.sort) {
  //   const sortBy = req.query.sort.split(',').join(' ');
  //   query = query.sort(sortBy)
  // }else{
  //   query.sort("-createdAt")
  // }

  // const page = req.query.page * 1 || 1;
  // const limit = req.query.limit * 1 || 100;

  // const skip = (page - 1) * limit;

  // query = query.skip(skip).limit(limit);

  const features = new ApiFeatures(TourModel.find(), req.query)
    .filter()
    .limit()
    .paginate();

  // after you filter , await results
  const tours = await features.query;
  try {
    return res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours: tours
      }
    });
  } catch (error) {
    return res.status(400).json({
      status: 'failed',
      messasage: error.message
    });
  }
};

exports.addTour = catchAsync(async (req, res, next) => {
  const newTour = await TourModel.create(req.body);
  return res.status(201).json({
    status: 201,
    data: {
      tour: newTour
    },
    message: 'Tour added successfully'
  });
  // try {
  //   return res.status(201).json({
  //     status: 201,
  //     data: {
  //       tour: newTour
  //     },
  //     message: 'Tour added successfully'
  //   });
  // } catch (error) {
  //   res.status(400).json({
  //     status: 400,
  //     message: error
  //   });
  // }
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await TourModel.findById(req.params.id).populate('reviews');
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  return res.status(201).json({
    status: 201,
    data: {
      tour
    },
    message: 'Tour added successfully'
  });
});

exports.updateTour = async (req, res) => {
  console.log(req.body);
  try {
    const updatedTour = await TourModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    return res.status(200).json({
      status: 201,
      data: {
        updatedTour
      },
      message: 'Tour Updated successfully'
    });
  } catch (error) {
    return res.status(201).json({
      status: 'fialed',
      message: error.message
    });
  }
};

//DELETE
exports.deleteTour = async (req, res) => {
  try {
    await TourModel.findByIdAndDelete(req.params.id);
    return res.status(204).json({
      status: 'success',
      message: 'tour deleted successfully'
    });
  } catch (error) {
    return res.status(400).json({
      status: 'failed',
      message: error.message
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await TourModel.aggregate([
      { $match: { ratingsAvaerage: { $gte: 4 } } },
      {
        $group: {
          // _id: null,
          //here we are grouping by difficulty
          _id: '$difficulty',
          avgRating: { $avg: '$ratingsAvaerage' },
          totalCount: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          numRatings: { $sum: '$ratingsQuantity' }
        }
      },
      {
        $sort: { avgPrice: 1 }
      },
      {
        $match: { _id: { $ne: 'easy' } }
      }
    ]);
    return res.status(200).json({
      status: 'success',
      message: stats
    });
  } catch (error) {
    return res.status(400).json({
      status: 'failed',
      message: error.message
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = +req.params.year;
    console.log(year);
    const plan = await TourModel.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: {
            $month: '$startDates'
          },
          count: { $sum: 1 },
          tours: { $push: '$name' }
        }
      },
      {
        $addFields: {
          month: '$_id'
        }
      },
      { $project: { _id: 0 } },
      {
        $sort: {
          count: -1
        }
      },
      {
        $limit: 5
      }
    ]);
    return res.status(200).json({
      status: 'success',
      message: plan
    });
  } catch (error) {
    return res.status(400).json({
      status: 'failed',
      message: error.message
    });
  }
};

exports.getClosestTour = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  console.log(req.params);

  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    return next(new AppError('please provide a latitude and a longitude', 400));
  }
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  const tours = await TourModel.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });
  return res.status(200).json({
    status: 'success',
    results: tours.length,
    data: tours
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  console.log(req.params);

  const multi = unit === 'mi' ? 0.000621371 : 0.001;

  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    return next(new AppError('please provide a latitude and a longitude', 400));
  }
  //geoNear needs to be first in piplines array
  // if you have onle one 2sphere index in your mongodb collection schema , geoNear will use it , otherwise u will have
  //to specify field name
  const tours = await TourModel.aggregate([
    {
      $geoNear: {
        near: {
          type: 'point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multi
      }
    },
    {
      $project: {
        distance: 1,
        name: 1,
        _id: 1
      }
    }
  ]);
  return res.status(200).json({
    status: 'success',
    results: tours.length,
    data: tours
  });
});

//============================================================================

//before mongoose

//============================================================================

// const fs = require("fs");
// const TOURS_FILE_PATH = `${__dirname}/../dev-data/data/tours-simple.json`
// const tours = JSON.parse(fs.readFileSync(TOURS_FILE_PATH));

// const getTourById = (id)=>{
//     return tours.find(tr => tr.id === id);
// }

// const writeToToursFile = (tours , CBF)=>{
//     fs.writeFile(TOURS_FILE_PATH , JSON.stringify(tours) ,CBF)
// }

// const filterTours = (id)=>{
//     return tours.filter(tr => tr.id !== id);
// }

// const checkId = (req , res, next , id)=>{
//     if(req.params.id * 1 > tours.length  ){
//         return res.status(404).json({
//             status : 404,
//             message : "Invalid Tour ID !",
//         });
//     }
//     next();
// }

// //INDEX
// exports.getTours = (req, res) => {
//     console.log(req.timeStamp);
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours: tours,
//     },
//   });
// };

// //CREATE
// exports.addTour=(req , res) => {
//     const newTourId = tours[tours.length - 1 ].id + 1
//     const newTour = Object.assign({id : newTourId}, req.body)

//     tours.push(newTour);

//     return writeToToursFile(tours , (err)=>{
//         res.status(201).json({
//             status : 201 ,
//             data:{
//                 tour : newTour
//             },
//             message : 'Tour added successfully'
//         })
//     })
// }

// //SHOW
// exports.getTour = (req , res)=>{
//     const tourId = +req.params.id ;
//     if (tourId){
//         const tour = getTourById(tourId);
//         if (tour) {
//             return res.status(200).json({
//                 status : 200 ,
//                 data:{
//                     tour : tour
//                 },
//             })
//         }
//         return res.status(404).json({status : 404 , message : 'Tour not found'})
//     }
// }

// //UPDATE
// exports.updateTour= (req , res)=>{
//     const tourId = +req.params.id;
//     if (tourId){
//         const tour = getTourById(tourId);
//         //update the tour
//         //remove old tour
//         //put the new tour
//         return writeToToursFile(tours ,  (err)=>{
//             res.status(201).json({
//                 status : 201 ,
//                 data:{
//                     tour : tour
//                 },
//                 message : 'Tour added successfully'
//             })
//         })
//     }
//     return res.status(404).json({status : 404 , message : 'Tour not found'})
// }

// //DELETE
// exports.deleteTour= (req , res)=>{
//     const tourId = +req.params.id;
//     if (tourId){
//         const tour = getTourById(tourId);
//         return res.status(204).json({
//             status : 204 ,
//             message : 'Tour Deleted successfully'
//         })
//     }
//     return res.status(404).json({status : 404 , message : 'Tour not found'})
// }
