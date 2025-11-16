const Bug = require('../models/Bug');
const { validateCreateBug, validateUpdateBug, isValidObjectId } = require('../utils/validation');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const { logInfo } = require('../utils/logger');

// Get all bugs with optional filtering and pagination
const getAllBugs = catchAsync(async (req, res) => {
  const {
    status,
    priority,
    assignee,
    reporter,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter object
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignee) filter.assignee = new RegExp(assignee, 'i');
  if (reporter) filter.reporter = new RegExp(reporter, 'i');

  // Calculate pagination
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  // Execute query with pagination
  const bugs = await Bug.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Bug.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  logInfo('Bugs retrieved successfully', {
    count: bugs.length,
    total,
    filter,
    userId: req.ip
  });

  res.status(200).json({
    status: 'success',
    results: bugs.length,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    data: {
      bugs
    }
  });
});

// Get a single bug by ID
const getBugById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return next(new AppError('Invalid bug ID format', 400));
  }

  const bug = await Bug.findById(id);

  if (!bug) {
    return next(new AppError('No bug found with that ID', 404));
  }

  logInfo('Bug retrieved successfully', {
    bugId: id,
    userId: req.ip
  });

  res.status(200).json({
    status: 'success',
    data: {
      bug
    }
  });
});

// Create a new bug
const createBug = catchAsync(async (req, res, next) => {
  // Validate input data
  const { error, value } = validateCreateBug(req.body);
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join('. ');
    return next(new AppError(errorMessage, 400));
  }

  // Create new bug
  const newBug = await Bug.create(value);

  logInfo('Bug created successfully', {
    bugId: newBug._id,
    title: newBug.title,
    reporter: newBug.reporter,
    userId: req.ip
  });

  res.status(201).json({
    status: 'success',
    data: {
      bug: newBug
    }
  });
});

// Update a bug
const updateBug = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return next(new AppError('Invalid bug ID format', 400));
  }

  // Validate input data
  const { error, value } = validateUpdateBug(req.body);
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join('. ');
    return next(new AppError(errorMessage, 400));
  }

  const bug = await Bug.findByIdAndUpdate(id, value, {
    new: true,
    runValidators: true
  });

  if (!bug) {
    return next(new AppError('No bug found with that ID', 404));
  }

  logInfo('Bug updated successfully', {
    bugId: id,
    updatedFields: Object.keys(value),
    userId: req.ip
  });

  res.status(200).json({
    status: 'success',
    data: {
      bug
    }
  });
});

// Delete a bug
const deleteBug = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return next(new AppError('Invalid bug ID format', 400));
  }

  const bug = await Bug.findByIdAndDelete(id);

  if (!bug) {
    return next(new AppError('No bug found with that ID', 404));
  }

  logInfo('Bug deleted successfully', {
    bugId: id,
    title: bug.title,
    userId: req.ip
  });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get bug statistics
const getBugStats = catchAsync(async (req, res) => {
  const stats = await Bug.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgAge: { 
          $avg: { 
            $divide: [
              { $subtract: [new Date(), '$createdAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  const priorityStats = await Bug.aggregate([
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  const total = await Bug.countDocuments();

  res.status(200).json({
    status: 'success',
    data: {
      total,
      statusStats: stats,
      priorityStats
    }
  });
});

module.exports = {
  getAllBugs,
  getBugById,
  createBug,
  updateBug,
  deleteBug,
  getBugStats
};
