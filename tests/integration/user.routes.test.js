const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('../../src/routes/user.routes');
const errorHandler = require('../../src/middleware/error.middleware');
const User = require('../../src/models/user.model');

// 设置环境变量
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

// 创建测试专用的 Express 应用
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/v1/user', userRoutes);
app.use(errorHandler);

describe('User Routes', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/v1/user/register', () => {
    it('should register new user', async () => {
      const res = await request(app)
        .post('/api/v1/user/register')
        .send({
          username: 'testuser',
          password: 'password123',
          email: 'test@example.com'
        });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('000000');
      expect(res.body.data.userId).toBeDefined();
    });

    it('should return error when username already exists', async () => {
      // 先注册一个用户
      await request(app)
        .post('/api/v1/user/register')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      // 尝试注册相同用户名
      const res = await request(app)
        .post('/api/v1/user/register')
        .send({
          username: 'testuser',
          password: 'differentpassword'
        });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('E00002');
      expect(res.body.msg).toBe('用户名已存在');
    });
  });

  describe('POST /api/v1/user/login', () => {
    beforeEach(async () => {
      // 确保用户存在
      await request(app)
        .post('/api/v1/user/register')
        .send({
          username: 'testuser',
          password: 'password123'
        });
    });

    it('should login successfully', async () => {
      const res = await request(app)
        .post('/api/v1/user/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('000000');
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.username).toBe('testuser');
    });

    it('should return error with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/user/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('E00004');
      expect(res.body.msg).toBe('用户名或密码错误');
    });
  });
}); 