const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const UserService = require('../../src/services/user.service');
const User = require('../../src/models/user.model');
const BusinessError = require('../../src/errors/BusinessError');
const ErrorCodes = require('../../src/constants/errorCodes');

describe('UserService', () => {
  let mongoServer;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test'; // 设置测试环境
    process.env.JWT_SECRET = 'test-secret'; // 设置测试用的 JWT 密钥
    
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

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com'
      };

      const user = await UserService.register(userData);

      expect(user).toBeDefined();
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // 密码应该被加密
    });

    it('should throw error if username already exists', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123'
      };

      await UserService.register(userData);

      await expect(UserService.register(userData))
        .rejects
        .toThrow(BusinessError);
      
      await expect(UserService.register(userData))
        .rejects
        .toMatchObject({
          code: ErrorCodes.USER_EXISTS,
          message: '用户名已存在'
        });
    });

    it('should set first user as admin', async () => {
      const userData = {
        username: 'admin',
        password: 'admin123'
      };

      const user = await UserService.register(userData);
      expect(user.isAdmin).toBe(true);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await UserService.register({
        username: 'testuser',
        password: 'password123'
      });
    });

    it('should login successfully with correct credentials', async () => {
      const result = await UserService.login('testuser', 'password123');

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.username).toBe('testuser');
    });

    it('should throw error with incorrect password', async () => {
      await expect(UserService.login('testuser', 'wrongpassword'))
        .rejects
        .toThrow('用户名或密码错误');
    });

    it('should throw error with non-existent username', async () => {
      await expect(UserService.login('nonexistent', 'password123'))
        .rejects
        .toThrow('用户名或密码错误');
    });
  });

  describe('getUserById', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await UserService.register({
        username: 'testuser',
        password: 'password123'
      });
    });

    it('should return user by id', async () => {
      const user = await UserService.getUserById(testUser._id);
      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
    });

    it('should throw error for non-existent user id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(UserService.getUserById(fakeId))
        .rejects
        .toThrow('用户不存在');
    });
  });

  describe('updateUser', () => {
    let testUser;
    let adminUser;

    beforeEach(async () => {
      adminUser = await UserService.register({
        username: 'admin',
        password: 'admin123'
      });

      testUser = await UserService.register({
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com'
      });
    });

    it('should update user profile', async () => {
      const updateData = {
        nickname: 'Test Nickname',
        email: 'new@example.com'
      };

      const updatedUser = await UserService.updateUser(
        testUser._id,
        updateData,
        testUser._id
      );

      expect(updatedUser.nickname).toBe(updateData.nickname);
      expect(updatedUser.email).toBe(updateData.email);
    });

    it('should allow admin to update isAdmin status', async () => {
      const updateData = {
        isAdmin: true
      };

      const updatedUser = await UserService.updateUser(
        testUser._id,
        updateData,
        adminUser._id
      );

      expect(updatedUser.isAdmin).toBe(true);
    });
  });
}); 