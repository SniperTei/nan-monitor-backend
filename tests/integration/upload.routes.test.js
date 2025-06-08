const request = require('supertest');
const path = require('path');
const fs = require('fs').promises;
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const uploadRoutes = require('../../src/routes/upload.routes');
const config = require('../../src/config');
const testEnv = require('../test.env');
const APIResponse = require('../../src/utils/api.response');

// 创建测试专用的 Express 应用
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/v1/upload', uploadRoutes);

// 添加错误处理中间件
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // 处理 multer 的错误
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.json(APIResponse.error('E00400', '文件大小超过限制'));
    }
    return res.json(APIResponse.error('E00400', '文件上传失败'));
  }
  // 处理其他错误
  res.status(500).json(APIResponse.serverError());
});

describe('Upload Routes', () => {
  let testImagePath;

  beforeAll(async () => {
    // 确保上传目录存在
    await fs.mkdir(config.uploadDir, { recursive: true });
  });

  beforeEach(async () => {
    // 创建测试文件
    testImagePath = path.join(config.uploadDir, 'test.jpg');
    await fs.writeFile(testImagePath, 'fake image content');
  });

  afterAll(async () => {
    // 清理上传目录
    await fs.rm(config.uploadDir, { recursive: true, force: true });
  });

  describe('POST /api/v1/upload/image', () => {
    it('should upload image successfully', async () => {
      const res = await request(app)
        .post('/api/v1/upload/image')
        .set('Authorization', `Bearer ${testEnv.TEST_TOKEN}`)
        .attach('file', testImagePath);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('000000');
      expect(res.body.data).toHaveProperty('filename');
      expect(res.body.data).toHaveProperty('url');
      expect(res.body.msg).toBe('上传成功');
    });

    it('should return error when no file is provided', async () => {
      const res = await request(app)
        .post('/api/v1/upload/image')
        .set('Authorization', `Bearer ${testEnv.TEST_TOKEN}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('E00400');
      expect(res.body.msg).toBe('请选择要上传的文件');
    });

    it('should return error when file type is not allowed', async () => {
      const testTextPath = path.join(config.uploadDir, 'test.txt');
      await fs.writeFile(testTextPath, 'test content');

      const res = await request(app)
        .post('/api/v1/upload/image')
        .set('Authorization', `Bearer ${testEnv.TEST_TOKEN}`)
        .attach('file', testTextPath);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('E00400');
      expect(res.body.msg).toBe('不支持的文件类型');

      await fs.unlink(testTextPath);
    });

    it('should return error when file size exceeds limit', async () => {
      // 创建一个超过大小限制的文件
      const largePath = path.join(config.uploadDir, 'large.jpg');
      const largeContent = Buffer.alloc(config.maxFileSize + 1);
      await fs.writeFile(largePath, largeContent);

      const res = await request(app)
        .post('/api/v1/upload/image')
        .set('Authorization', `Bearer ${testEnv.TEST_TOKEN}`)
        .attach('file', largePath);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('E00400');
      expect(res.body.msg).toBe('文件大小超过限制');

      await fs.unlink(largePath);
    });
  });

  describe('DELETE /api/v1/upload/:filename', () => {
    it('should delete file successfully', async () => {
      // 先上传文件
      const uploadRes = await request(app)
        .post('/api/v1/upload/image')
        .set('Authorization', `Bearer ${testEnv.TEST_TOKEN}`)
        .attach('file', testImagePath);

      const filename = uploadRes.body.data.filename;

      // 删除文件
      const deleteRes = await request(app)
        .delete(`/api/v1/upload/${filename}`)
        .set('Authorization', `Bearer ${testEnv.TEST_TOKEN}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.code).toBe('000000');
      expect(deleteRes.body.msg).toBe('删除成功');
    });

    it('should return error when file does not exist', async () => {
      const res = await request(app)
        .delete('/api/v1/upload/non-existent.jpg')
        .set('Authorization', `Bearer ${testEnv.TEST_TOKEN}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('E00404');
      expect(res.body.msg).toBe('文件不存在');
    });
  });
}); 