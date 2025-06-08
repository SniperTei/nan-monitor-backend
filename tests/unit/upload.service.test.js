const fs = require('fs').promises;
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const UploadService = require('../../src/services/upload.service');
const config = require('../../src/config');

describe('UploadService', () => {
  let mongoServer;
  let uploadService;
  let testFilePath;

  beforeAll(async () => {
    // 设置测试环境
    process.env.NODE_ENV = 'test';
    
    // 创建测试数据库连接
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // 创建上传服务实例
    uploadService = new UploadService();

    // 确保测试上传目录存在
    await fs.mkdir(config.uploadDir, { recursive: true });
  });

  afterAll(async () => {
    // 清理测试数据库
    await mongoose.disconnect();
    await mongoServer.stop();

    // 清理测试上传目录
    await fs.rm(config.uploadDir, { recursive: true, force: true });
  });

  beforeEach(async () => {
    // 创建测试文件
    testFilePath = path.join(config.uploadDir, 'test.txt');
    await fs.writeFile(testFilePath, 'test content');
  });

  afterEach(async () => {
    // 清理测试文件
    await fs.unlink(testFilePath).catch(() => {});
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        path: testFilePath
      };

      const result = await uploadService.uploadFile(mockFile, 'image');
      
      expect(result).toBeDefined();
      expect(result.filename).toBeDefined();
      expect(result.originalname).toBe('test.jpg');
      expect(result.mimetype).toBe('image/jpeg');
      expect(result.size).toBe(1024);
      
      // 验证文件是否实际存在
      const exists = await fs.access(path.join(config.uploadDir, result.filename))
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(true);
    });

    it('should throw error if file size exceeds limit', async () => {
      const mockFile = {
        originalname: 'large.jpg',
        mimetype: 'image/jpeg',
        size: config.maxFileSize + 1,
        path: testFilePath
      };

      await expect(uploadService.uploadFile(mockFile, 'image'))
        .rejects
        .toThrow('文件大小超过限制');
    });

    it('should throw error if file type is not allowed', async () => {
      const mockFile = {
        originalname: 'test.exe',
        mimetype: 'application/x-msdownload',
        size: 1024,
        path: testFilePath
      };

      await expect(uploadService.uploadFile(mockFile, 'image'))
        .rejects
        .toThrow('不支持的文件类型');
    });

    it('should throw error if file category is invalid', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        path: testFilePath
      };

      await expect(uploadService.uploadFile(mockFile, 'invalid-category'))
        .rejects
        .toThrow('无效的文件类别');
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      // 先上传文件
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        path: testFilePath
      };

      const uploadResult = await uploadService.uploadFile(mockFile, 'image');
      
      // 删除文件
      await uploadService.deleteFile(uploadResult.filename);
      
      // 验证文件是否已被删除
      const exists = await fs.access(path.join(config.uploadDir, uploadResult.filename))
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(false);
    });

    it('should throw error if file does not exist', async () => {
      await expect(uploadService.deleteFile('non-existent-file.jpg'))
        .rejects
        .toThrow('文件不存在');
    });
  });
}); 