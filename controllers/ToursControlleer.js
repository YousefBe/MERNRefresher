const TourModel = require('../models/Tour');



exports.getBestTours = async (req , res , next)=>{
    req.query.limit = '5' ;
    req.query.sort =  "-ratingsAverage,price" ;
    req.query.fields = "name,price,ratingsAvaerage,summary,difficulty";
    next();
} 

exports.getTours = async (req, res) => {
  const queryObject = {...req.query};
  const qeuryLength = Object.keys(queryObject).length
  

  const exludeFields = ["page", "sort","limit","fields"];
  exludeFields.forEach(field =>delete queryObject[field]);

  let queryString = JSON.stringify(queryObject);
  queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g , match => `$${match}`);
  if(!qeuryLength){
    queryString = null
  }

  //first : DON"T AWAIT THIS
  let query = TourModel.find(JSON.parse(queryString));

  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields)
  }else{
    //the minus means exclude this field from the results
    query = query.select("-__v")
  }


  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy)
  }else{
    query.sort("-createdAt")
  }

  const page = req.query.page * 1  || 1 ;
  const limit = req.query.limit  * 1 || 100;
  
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit)

  if (req.query.page) {
    const toursCount = await TourModel.countDocuments();
    if (skip > toursCount) {
      throw new Error("Page m4 mawgoda")
    }
  }



  // after you filter , await results
  const tours = await query;
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


exports.addTour = async (req, res) => {
  const newTour = await TourModel.create(req.body);
  try {
    return res.status(201).json({
      status: 201,
      data: {
        tour: newTour
      },
      message: 'Tour added successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: error
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await TourModel.findById(req.params.id);
    return res.status(201).json({
      status: 201,
      data: {
        tour
      },
      message: 'Tour added successfully'
    });
  } catch (err) {
    return res.status(201).json({
      status: 'failed',
      message: err.message
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const updatedTour = TourModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
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
