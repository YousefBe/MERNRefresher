const AppError = require('../utls/appError');
const catchAsync = require('../utls/catchAsync');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No Document With that ID was found'));
    }
    return res.status(204).json({
      status: 'success',
      message: 'tour deleted successfully'
    });
  });
