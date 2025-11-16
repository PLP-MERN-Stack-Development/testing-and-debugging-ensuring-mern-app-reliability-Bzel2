const mongoose = require('mongoose');

const bugSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Bug title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Bug description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['open', 'in-progress', 'resolved', 'closed'],
      message: 'Status must be one of: open, in-progress, resolved, closed'
    },
    default: 'open'
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: 'Priority must be one of: low, medium, high, critical'
    },
    default: 'medium'
  },
  assignee: {
    type: String,
    trim: true,
    maxlength: [50, 'Assignee name cannot exceed 50 characters']
  },
  reporter: {
    type: String,
    required: [true, 'Reporter name is required'],
    trim: true,
    maxlength: [50, 'Reporter name cannot exceed 50 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  stepsToReproduce: {
    type: String,
    trim: true,
    maxlength: [2000, 'Steps to reproduce cannot exceed 2000 characters']
  },
  environment: {
    type: String,
    trim: true,
    maxlength: [200, 'Environment description cannot exceed 200 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for bug age in days
bugSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Index for better query performance
bugSchema.index({ status: 1, priority: 1 });
bugSchema.index({ createdAt: -1 });

// Pre-save middleware for data validation and transformation
bugSchema.pre('save', function(next) {
  // Convert tags to lowercase
  if (this.tags) {
    this.tags = this.tags.map(tag => tag.toLowerCase());
  }
  next();
});

// Static method to get bugs by status
bugSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

// Instance method to close bug
bugSchema.methods.close = function() {
  this.status = 'closed';
  return this.save();
};

module.exports = mongoose.model('Bug', bugSchema);
