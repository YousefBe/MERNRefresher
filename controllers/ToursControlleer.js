const fs = require("fs");
const TOURS_FILE_PATH = `${__dirname}/../dev-data/data/tours-simple.json`
const tours = JSON.parse(fs.readFileSync(TOURS_FILE_PATH));


const getTourById = (id)=>{
    return tours.find(tr => tr.id === id);
}

const writeToToursFile = (tours , CBF)=>{
    fs.writeFile(TOURS_FILE_PATH , JSON.stringify(tours) ,CBF)
}

const filterTours = (id)=>{
    return tours.filter(tr => tr.id !== id);
}

//INDEX 
exports.getTours = (req, res) => {
    console.log(req.timeStamp);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
};

//CREATE 
exports.addTour=(req , res) => {
    const newTourId = tours[tours.length - 1 ].id + 1
    const newTour = Object.assign({id : newTourId}, req.body)

    tours.push(newTour);

    return writeToToursFile(tours , (err)=>{
        res.status(201).json({
            status : 201 ,
            data:{
                tour : newTour
            },
            message : 'Tour added successfully'
        })
    })
}

//SHOW
exports.getTour = (req , res)=>{
    const tourId = +req.params.id ;
    if (tourId){
        const tour = getTourById(tourId);
        if (tour) {
            return res.status(200).json({
                status : 200 ,
                data:{
                    tour : tour
                },
            })
        }
        return res.status(404).json({status : 404 , message : 'Tour not found'})
    }
}

//UPDATE
exports.updateTour= (req , res)=>{
    const tourId = +req.params.id;
    if (tourId){
        const tour = getTourById(tourId);
        //update the tour
        //remove old tour
        //put the new tour
        return writeToToursFile(tours ,  (err)=>{
            res.status(201).json({
                status : 201 ,
                data:{
                    tour : tour
                },
                message : 'Tour added successfully'
            })
        })
    }
    return res.status(404).json({status : 404 , message : 'Tour not found'})
}

//DELETE
exports.deleteTour= (req , res)=>{
    const tourId = +req.params.id;
    if (tourId){
        const tour = getTourById(tourId);
        return res.status(204).json({
            status : 204 ,
            message : 'Tour Deleted successfully'
        })
    }
    return res.status(404).json({status : 404 , message : 'Tour not found'})
}