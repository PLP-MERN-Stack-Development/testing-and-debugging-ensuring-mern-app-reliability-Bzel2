const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server');
const Bug = require('../../models/Bug');

describe('Bug API Integration Tests', () => {
  let mongoServer;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Clean up
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear the database before each test
    await Bug.deleteMany({});
  });

  describe('POST /api/bugs', () => {
    test('should create a new bug with valid data', async () => {
      const newBug = {
        title: 'Test Bug',
        description: 'This is a test bug description',
        priority: 'high',
        reporter: 'John Doe',
        assignee: 'Jane Smith',
        tags: ['frontend', 'ui']
      };

      const response = await request(app)
        .post('/api/bugs')
        .send(newBug)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.bug).toMatchObject({
        title: newBug.title,
        description: newBug.description,
        priority: newBug.priority,
        reporter: newBug.reporter,
        assignee: newBug.assignee,
        status: 'open' // default status
      });
      expect(response.body.data.bug._id).toBeDefined();
      expect(response.body.data.bug.createdAt).toBeDefined();
    });

    test('should return 400 for invalid bug data', async () => {
      const invalidBug = {
        title: 'AB', // Too short
        description: 'Short', // Too short
        // Missing required reporter field
      };

      const response = await request(app)
        .post('/api/bugs')
        .send(invalidBug)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Title must be at least 3 characters long');
    });

    test('should set default values correctly', async () => {
      const minimalBug = {
        title: 'Minimal Bug',
        description: 'This is a minimal bug description',
        reporter: 'John Doe'
      };

      const response = await request(app)
        .post('/api/bugs')
        .send(minimalBug)
        .expect(201);

      expect(response.body.data.bug.status).toBe('open');
      expect(response.body.data.bug.priority).toBe('medium');
    });
  });

  describe('GET /api/bugs', () => {
    beforeEach(async () => {
      // Create test bugs
      const testBugs = [
        {
          title: 'Bug 1',
          description: 'First test bug description',
          status: 'open',
          priority: 'high',
          reporter: 'John Doe',
          assignee: 'Jane Smith'
        },
        {
          title: 'Bug 2',
          description: 'Second test bug description',
          status: 'in-progress',
          priority: 'medium',
          reporter: 'Alice Johnson',
          assignee: 'Bob Wilson'
        },
        {
          title: 'Bug 3',
          description: 'Third test bug description',
          status: 'resolved',
          priority: 'low',
          reporter: 'Charlie Brown'
        }
      ];

      await Bug.insertMany(testBugs);
    });

    test('should return all bugs', async () => {
      const response = await request(app)
        .get('/api/bugs')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.results).toBe(3);
      expect(response.body.data.bugs).toHaveLength(3);
      expect(response.body.pagination).toBeDefined();
    });

    test('should filter bugs by status', async () => {
      const response = await request(app)
        .get('/api/bugs?status=open')
        .expect(200);

      expect(response.body.results).toBe(1);
      expect(response.body.data.bugs[0].status).toBe('open');
    });

    test('should filter bugs by priority', async () => {
      const response = await request(app)
        .get('/api/bugs?priority=high')
        .expect(200);

      expect(response.body.results).toBe(1);
      expect(response.body.data.bugs[0].priority).toBe('high');
    });

    test('should implement pagination', async () => {
      const response = await request(app)
        .get('/api/bugs?page=1&limit=2')
        .expect(200);

      expect(response.body.results).toBe(2);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.totalPages).toBe(2);
      expect(response.body.pagination.hasNext).toBe(true);
    });

    test('should sort bugs', async () => {
      const response = await request(app)
        .get('/api/bugs?sortBy=title&sortOrder=asc')
        .expect(200);

      const titles = response.body.data.bugs.map(bug => bug.title);
      expect(titles).toEqual(['Bug 1', 'Bug 2', 'Bug 3']);
    });
  });

  describe('GET /api/bugs/:id', () => {
    let bugId;

    beforeEach(async () => {
      const bug = await Bug.create({
        title: 'Test Bug',
        description: 'Test bug description',
        reporter: 'John Doe'
      });
      bugId = bug._id.toString();
    });

    test('should return bug by valid ID', async () => {
      const response = await request(app)
        .get(`/api/bugs/${bugId}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.bug._id).toBe(bugId);
      expect(response.body.data.bug.title).toBe('Test Bug');
    });

    test('should return 404 for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/bugs/${nonExistentId}`)
        .expect(404);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('No bug found with that ID');
    });

    test('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/bugs/invalid-id')
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('Invalid bug ID format');
    });
  });

  describe('PATCH /api/bugs/:id', () => {
    let bugId;

    beforeEach(async () => {
      const bug = await Bug.create({
        title: 'Test Bug',
        description: 'Test bug description',
        reporter: 'John Doe',
        status: 'open'
      });
      bugId = bug._id.toString();
    });

    test('should update bug with valid data', async () => {
      const updateData = {
        status: 'in-progress',
        assignee: 'Jane Smith'
      };

      const response = await request(app)
        .patch(`/api/bugs/${bugId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.bug.status).toBe('in-progress');
      expect(response.body.data.bug.assignee).toBe('Jane Smith');
    });

    test('should return 404 for non-existent bug', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .patch(`/api/bugs/${nonExistentId}`)
        .send({ status: 'resolved' })
        .expect(404);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('No bug found with that ID');
    });

    test('should return 400 for invalid update data', async () => {
      const invalidUpdate = {
        status: 'invalid-status'
      };

      const response = await request(app)
        .patch(`/api/bugs/${bugId}`)
        .send(invalidUpdate)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Status must be one of');
    });
  });

  describe('DELETE /api/bugs/:id', () => {
    let bugId;

    beforeEach(async () => {
      const bug = await Bug.create({
        title: 'Test Bug',
        description: 'Test bug description',
        reporter: 'John Doe'
      });
      bugId = bug._id.toString();
    });

    test('should delete bug by ID', async () => {
      await request(app)
        .delete(`/api/bugs/${bugId}`)
        .expect(204);

      // Verify bug is deleted
      const deletedBug = await Bug.findById(bugId);
      expect(deletedBug).toBeNull();
    });

    test('should return 404 for non-existent bug', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/bugs/${nonExistentId}`)
        .expect(404);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('No bug found with that ID');
    });
  });

  describe('GET /api/bugs/stats', () => {
    beforeEach(async () => {
      const testBugs = [
        { title: 'Bug 1', description: 'Desc 1', reporter: 'John', status: 'open', priority: 'high' },
        { title: 'Bug 2', description: 'Desc 2', reporter: 'Jane', status: 'open', priority: 'medium' },
        { title: 'Bug 3', description: 'Desc 3', reporter: 'Bob', status: 'resolved', priority: 'low' }
      ];
      await Bug.insertMany(testBugs);
    });

    test('should return bug statistics', async () => {
      const response = await request(app)
        .get('/api/bugs/stats')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.total).toBe(3);
      expect(response.body.data.statusStats).toBeDefined();
      expect(response.body.data.priorityStats).toBeDefined();
    });
  });
});
