const Joi = require('joi');

// Bug validation schemas
const createBugSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 100 characters'
    }),
  
  description: Joi.string()
    .trim()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.empty': 'Description is required',
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  
  priority: Joi.string()
    .valid('low', 'medium', 'high', 'critical')
    .default('medium')
    .messages({
      'any.only': 'Priority must be one of: low, medium, high, critical'
    }),
  
  assignee: Joi.string()
    .trim()
    .max(50)
    .allow('')
    .messages({
      'string.max': 'Assignee name cannot exceed 50 characters'
    }),
  
  reporter: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Reporter name is required',
      'string.min': 'Reporter name must be at least 2 characters long',
      'string.max': 'Reporter name cannot exceed 50 characters'
    }),
  
  tags: Joi.array()
    .items(Joi.string().trim().max(20))
    .max(5)
    .messages({
      'array.max': 'Cannot have more than 5 tags',
      'string.max': 'Each tag cannot exceed 20 characters'
    }),
  
  stepsToReproduce: Joi.string()
    .trim()
    .max(2000)
    .allow('')
    .messages({
      'string.max': 'Steps to reproduce cannot exceed 2000 characters'
    }),
  
  environment: Joi.string()
    .trim()
    .max(200)
    .allow('')
    .messages({
      'string.max': 'Environment description cannot exceed 200 characters'
    })
});

const updateBugSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .messages({
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 100 characters'
    }),
  
  description: Joi.string()
    .trim()
    .min(10)
    .max(1000)
    .messages({
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  
  status: Joi.string()
    .valid('open', 'in-progress', 'resolved', 'closed')
    .messages({
      'any.only': 'Status must be one of: open, in-progress, resolved, closed'
    }),
  
  priority: Joi.string()
    .valid('low', 'medium', 'high', 'critical')
    .messages({
      'any.only': 'Priority must be one of: low, medium, high, critical'
    }),
  
  assignee: Joi.string()
    .trim()
    .max(50)
    .allow('')
    .messages({
      'string.max': 'Assignee name cannot exceed 50 characters'
    }),
  
  reporter: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'Reporter name must be at least 2 characters long',
      'string.max': 'Reporter name cannot exceed 50 characters'
    }),
  
  tags: Joi.array()
    .items(Joi.string().trim().max(20))
    .max(5)
    .messages({
      'array.max': 'Cannot have more than 5 tags',
      'string.max': 'Each tag cannot exceed 20 characters'
    }),
  
  stepsToReproduce: Joi.string()
    .trim()
    .max(2000)
    .allow('')
    .messages({
      'string.max': 'Steps to reproduce cannot exceed 2000 characters'
    }),
  
  environment: Joi.string()
    .trim()
    .max(200)
    .allow('')
    .messages({
      'string.max': 'Environment description cannot exceed 200 characters'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Validation helper functions
const validateCreateBug = (data) => {
  return createBugSchema.validate(data, { abortEarly: false });
};

const validateUpdateBug = (data) => {
  return updateBugSchema.validate(data, { abortEarly: false });
};

// Additional helper functions for testing
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

module.exports = {
  validateCreateBug,
  validateUpdateBug,
  sanitizeInput,
  isValidObjectId
};
