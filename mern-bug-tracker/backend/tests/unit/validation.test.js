const {
  validateCreateBug,
  validateUpdateBug,
  sanitizeInput,
  isValidObjectId
} = require('../../utils/validation');

describe('Validation Utils', () => {
  describe('validateCreateBug', () => {
    test('should validate valid bug data', () => {
      const validBug = {
        title: 'Test Bug Title',
        description: 'This is a test bug description that is long enough',
        priority: 'high',
        reporter: 'John Doe',
        assignee: 'Jane Smith',
        tags: ['frontend', 'ui'],
        stepsToReproduce: 'Step 1, Step 2, Step 3',
        environment: 'Chrome 91, Windows 10'
      };

      const { error, value } = validateCreateBug(validBug);
      expect(error).toBeUndefined();
      expect(value).toMatchObject(validBug);
    });

    test('should require title', () => {
      const invalidBug = {
        description: 'This is a test bug description that is long enough',
        reporter: 'John Doe'
      };

      const { error } = validateCreateBug(invalidBug);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('is required');
    });

    test('should require description', () => {
      const invalidBug = {
        title: 'Test Bug',
        reporter: 'John Doe'
      };

      const { error } = validateCreateBug(invalidBug);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('is required');
    });

    test('should require reporter', () => {
      const invalidBug = {
        title: 'Test Bug',
        description: 'This is a test bug description that is long enough'
      };

      const { error } = validateCreateBug(invalidBug);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('is required');
    });

    test('should validate title length', () => {
      const invalidBug = {
        title: 'AB', // Too short
        description: 'This is a test bug description that is long enough',
        reporter: 'John Doe'
      };

      const { error } = validateCreateBug(invalidBug);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Title must be at least 3 characters long');
    });

    test('should validate description length', () => {
      const invalidBug = {
        title: 'Test Bug',
        description: 'Short', // Too short
        reporter: 'John Doe'
      };

      const { error } = validateCreateBug(invalidBug);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Description must be at least 10 characters long');
    });

    test('should validate priority values', () => {
      const invalidBug = {
        title: 'Test Bug',
        description: 'This is a test bug description that is long enough',
        priority: 'invalid-priority',
        reporter: 'John Doe'
      };

      const { error } = validateCreateBug(invalidBug);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Priority must be one of: low, medium, high, critical');
    });

    test('should limit number of tags', () => {
      const invalidBug = {
        title: 'Test Bug',
        description: 'This is a test bug description that is long enough',
        reporter: 'John Doe',
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'] // Too many tags
      };

      const { error } = validateCreateBug(invalidBug);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Cannot have more than 5 tags');
    });
  });

  describe('validateUpdateBug', () => {
    test('should validate partial update data', () => {
      const updateData = {
        status: 'in-progress',
        assignee: 'Jane Smith'
      };

      const { error, value } = validateUpdateBug(updateData);
      expect(error).toBeUndefined();
      expect(value).toMatchObject(updateData);
    });

    test('should require at least one field for update', () => {
      const emptyUpdate = {};

      const { error } = validateUpdateBug(emptyUpdate);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('At least one field must be provided for update');
    });

    test('should validate status values', () => {
      const invalidUpdate = {
        status: 'invalid-status'
      };

      const { error } = validateUpdateBug(invalidUpdate);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Status must be one of: open, in-progress, resolved, closed');
    });
  });

  describe('sanitizeInput', () => {
    test('should remove dangerous characters', () => {
      const input = '<script>alert("xss")</script>Hello World';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('scriptalert("xss")/scriptHello World');
    });

    test('should trim whitespace', () => {
      const input = '  Hello World  ';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('Hello World');
    });

    test('should handle non-string input', () => {
      expect(sanitizeInput(123)).toBe(123);
      expect(sanitizeInput(null)).toBe(null);
      expect(sanitizeInput(undefined)).toBe(undefined);
    });
  });

  describe('isValidObjectId', () => {
    test('should validate correct MongoDB ObjectId', () => {
      const validId = '507f1f77bcf86cd799439011';
      expect(isValidObjectId(validId)).toBe(true);
    });

    test('should reject invalid ObjectId', () => {
      expect(isValidObjectId('invalid-id')).toBe(false);
      expect(isValidObjectId('123')).toBe(false);
      expect(isValidObjectId('')).toBe(false);
      expect(isValidObjectId(null)).toBe(false);
    });

    test('should handle different ObjectId formats', () => {
      const validIds = [
        '507f1f77bcf86cd799439011',
        '507F1F77BCF86CD799439011', // uppercase
        'a'.repeat(24) // 24 characters
      ];

      validIds.forEach(id => {
        expect(isValidObjectId(id)).toBe(true);
      });
    });
  });
});
