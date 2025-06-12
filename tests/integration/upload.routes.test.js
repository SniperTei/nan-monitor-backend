const request = require('supertest');
const path = require('path');
const fs = require('fs').promises;
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const uploadRoutes = require('../../src/routes/upload.routes');
const config = require('../../src/config');
const testEnv = require('../test.env');
const APIResponse = require('../../src/utils/api.response');
const Log = require('../../src/models/log.model');

// 创建测试专用的 Express 应用
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/v1/upload', uploadRoutes);

// 修改错误处理中间件
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.json(APIResponse.error('E00400', '文件大小超过限制'));
      case 'LIMIT_FILE_COUNT':
        return res.json(APIResponse.error('E00400', '超出文件数量限制'));
      case 'LIMIT_UNEXPECTED_FILE':
        return res.json(APIResponse.error('E00400', '超出文件数量限制'));
      default:
        return res.json(APIResponse.error('E00400', '文件上传失败'));
    }
  }
  res.status(500).json(APIResponse.serverError());
});

describe('Upload Routes', () => {
  let testImagePath1;
  let testImagePath2;
  let testZipPath1;
  let testZipPath2;
  let testUserId;

  beforeAll(async () => {
    // 连接测试数据库
    await mongoose.connect(process.env.MONGODB_TEST_URI);
    await fs.mkdir(config.uploadDir, { recursive: true });
    // 创建测试用户ID
    testUserId = new mongoose.Types.ObjectId();
  });

  beforeEach(async () => {
    // 创建测试文件
    testImagePath1 = path.join(config.uploadDir, 'test1.jpg');
    testImagePath2 = path.join(config.uploadDir, 'test2.jpg');
    testZipPath1 = path.join(config.uploadDir, 'test1.zip');
    testZipPath2 = path.join(config.uploadDir, 'test2.zip');

    await Promise.all([
      fs.writeFile(testImagePath1, 'fake image content 1'),
      fs.writeFile(testImagePath2, 'fake image content 2'),
      fs.writeFile(testZipPath1, 'fake zip content 1'),
      fs.writeFile(testZipPath2, 'fake zip content 2')
    ]);

    // 清理测试数据
    await Log.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await fs.rm(config.uploadDir, { recursive: true, force: true });
  });

  afterEach(async () => {
    await fs.rm(config.uploadDir, { recursive: true, force: true });
    await fs.mkdir(config.uploadDir, { recursive: true });
    await Log.deleteMany({});
  });

  describe('单文件上传测试', () => {
    describe('POST /api/v1/upload/single/image', () => {
      it('应该成功上传单个图片并创建日志记录', async () => {
        const deviceId = 'test-device-001';
        const date = '2024-03-20';

        const res = await request(app)
          .post('/api/v1/upload/single/image')
          .set('Authorization', `Bearer ${testEnv.TEST_TOKEN}`)
          .field('deviceId', deviceId)
          .field('date', date)
          .attach('file', testImagePath1);

        expect(res.status).toBe(200);
        expect(res.body.code).toBe('000000');
        expect(res.body.data).toHaveProperty('filename');
        expect(res.body.data).toHaveProperty('url');
        expect(res.body.msg).toBe('上传成功');

        // 验证日志记录
        const log = await Log.findOne({ deviceId });
        expect(log).toBeTruthy();
        expect(log.date).toBe(date);
        expect(log.metadata.get('fileType')).toBe('image');
        expect(log.metadata.get('uploadType')).toBe('single');
      });

      it('上传文件时不提供deviceId应该只上传文件不创建日志', async () => {
        const res = await request(app)
          .post('/api/v1/upload/single/image')
          .set('Authorization', `Bearer ${testEnv.TEST_TOKEN}`)
          .attach('file', testImagePath1);

        expect(res.status).toBe(200);
        expect(res.body.code).toBe('000000');

        // 验证没有创建日志
        const logsCount = await Log.countDocuments();
        expect(logsCount).toBe(0);
      });

      it('不提供date时应使用当前日期创建日志', async () => {
        const deviceId = 'test-device-002';
        const today = new Date().toISOString().split('T')[0];

        const res = await request(app)
          .post('/api/v1/upload/single/image')
          .set('Authorization', `Bearer ${testEnv.TEST_TOKEN}`)
          .field('deviceId', deviceId)
          .attach('file', testImagePath1);

        expect(res.status).toBe(200);
        expect(res.body.code).toBe('000000');

        // 验证日志使用了当前日期
        const log = await Log.findOne({ deviceId });
        expect(log.date).toBe(today);
      });

      it('未提供文件时应返回错误', async () => {
        const res = await request(app)
          .post('/api/v1/upload/single/image')
          .set('Authorization', `Bearer ${testEnv.TEST_TOKEN}`);

        expect(res.status).toBe(200);
        expect(res.body.code).toBe('E00400');
        expect(res.body.msg).toBe('请选择要上传的文件');
      });

      it('上传不支持的文件类型时应返回错误', async () => {
        const testTextPath = path.join(config.uploadDir, 'test.txt');
        await fs.writeFile(testTextPath, 'test content');

        const res = await request(app)
          .post('/api/v1/upload/single/image')
          .set('Authorization', `Bearer ${testEnv.TEST_TOKEN}`)
          .attach('file', testTextPath);

        expect(res.status).toBe(200);
        expect(res.body.code).toBe('E00400');
        expect(res.body.msg).toBe('不支持的文件类型');

        await fs.unlink(testTextPath);
      });
    });

    describe('POST /api/v1/upload/single/archive', () => {
      it('应该成功上传单个压缩文件', async () => {
        const res = await request(app)
          .post('/api/v1/upload/single/archive')
          .set('Authorization', `Bearer ${testEnv.TEST_TOKEN}`)
          .attach('file', testZipPath1);

        expect(res.status).toBe(200);
        expect(res.body.code).toBe('000000');
        expect(res.body.data).toHaveProperty('filename');
        expect(res.body.data).toHaveProperty('url');
        expect(res.body.msg).toBe('上传成功');
      });
    });
  });

  describe('多文件上传测试', () => {
    describe('POST /api/v1/upload/multiple/image', () => {
      it('应该成功上传多个图片并为每个文件创建日志记录', async () => {
        const deviceId = 'test-device-003';
        const date = '2024-03-20';

        const res = await request(app)
          .post('/api/v1/upload/multiple/image')
          .set('Authorization', `Bearer ${testEnv.TEST_TOKEN}`)
          .field('deviceId', deviceId)
          .field('date', date)
          .attach('fileList', testImagePath1)
          .attach('fileList', testImagePath2);

        expect(res.status).toBe(200);
        expect(res.body.code).toBe('000000');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBe(2);

        // 验证为每个文件创建了日志记录
        const logs = await Log.find({ deviceId });
        expect(logs.length).toBe(2);
        logs.forEach(log => {
          expect(log.date).toBe(date);
          expect(log.metadata.get('fileType')).toBe('image');
          expect(log.metadata.get('uploadType')).toBe('multiple');
        });
      });

      it('上传多个文件时不提供deviceId应该只上传文件不创建日志', async () => {
        const res = await request(app)
          .post('/api/v1/upload/multiple/image')
          .set('Authorization', `Bearer ${testEnv.TEST_TOKEN}`)
          .attach('fileList', testImagePath1)
          .attach('fileList', testImagePath2);

        expect(res.status).toBe(200);
        expect(res.body.code).toBe('000000');
        expect(res.body.data.length).toBe(2);

        // 验证没有创建日志
        const logsCount = await Log.countDocuments();
        expect(logsCount).toBe(0);
      });

      it('超出文件数量限制时应返回错误', async () => {
        // 创建11个文件的请求（超过10个的限制）
        const request11Files = request(app)
          .post('/api/v1/upload/multiple/image')
          .set('Authorization', `Bearer ${testEnv.TEST_TOKEN}`);
        
        // 添加11个文件到同一个请求中
        for (let i = 0; i < 11; i++) {
          request11Files.attach('files', testImagePath1);
        }

        const res = await request11Files;

        expect(res.status).toBe(200);
        expect(res.body.code).toBe('E00400');
        expect(res.body.msg).toBe('超出文件数量限制');
      });

      // 添加一个新的测试用例验证最大允许数量
      it('应该允许上传最大数量（10个）文件', async () => {
        const request10Files = request(app)
          .post('/api/v1/upload/multiple/image')
          .set('Authorization', `Bearer ${testEnv.TEST_TOKEN}`);
        
        // 添加10个文件到请求中
        for (let i = 0; i < 10; i++) {
          request10Files.attach('files', testImagePath1);
        }

        const res = await request10Files;

        expect(res.status).toBe(200);
        expect(res.body.code).toBe('000000');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBe(10);
        expect(res.body.msg).toBe('上传成功');
      });
    });

    describe('POST /api/v1/upload/multiple/archive', () => {
      it('应该成功上传多个压缩文件', async () => {
        const res = await request(app)
          .post('/api/v1/upload/multiple/archive')
          .set('Authorization', `Bearer ${testEnv.TEST_TOKEN}`)
          .attach('files', testZipPath1)
          .attach('files', testZipPath2);

        expect(res.status).toBe(200);
        expect(res.body.code).toBe('000000');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBe(2);
        expect(res.body.msg).toBe('上传成功');
      });
    });
  });

  describe('日志相关测试', () => {
    it('应该能按设备ID和日期查询到上传记录', async () => {
      const deviceId = 'test-device-004';
      const date = '2024-03-20';

      // 先上传文件创建日志
      await request(app)
        .post('/api/v1/upload/single/image')
        .set('Authorization', `Bearer ${testEnv.TEST_TOKEN}`)
        .field('deviceId', deviceId)
        .field('date', date)
        .attach('file', testImagePath1);

      // 查询日志
      const res = await request(app)
        .get('/api/v1/logs')
        .set('Authorization', `Bearer ${testEnv.TEST_TOKEN}`)
        .query({ deviceId, date });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('000000');
      expect(res.body.data.logs.length).toBe(1);
      expect(res.body.data.logs[0].deviceId).toBe(deviceId);
      expect(res.body.data.logs[0].date).toBe(date);
    });
  });

  describe('DELETE /api/v1/upload/:filename', () => {
    it('应该成功删除文件', async () => {
      const uploadRes = await request(app)
        .post('/api/v1/upload/single/image')
        .set('Authorization', `Bearer ${testEnv.TEST_TOKEN}`)
        .attach('file', testImagePath1);

      const filename = uploadRes.body.data.filename;

      const deleteRes = await request(app)
        .delete(`/api/v1/upload/${filename}`)
        .set('Authorization', `Bearer ${testEnv.TEST_TOKEN}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.code).toBe('000000');
      expect(deleteRes.body.msg).toBe('删除成功');
    });

    it('删除不存在的文件时应返回错误', async () => {
      const res = await request(app)
        .delete('/api/v1/upload/non-existent.jpg')
        .set('Authorization', `Bearer ${testEnv.TEST_TOKEN}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('E00404');
      expect(res.body.msg).toBe('文件不存在');
    });
  });
}); 