const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/upload.controller');
const authMiddleware = require('../middleware/auth.middleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: require('../config').maxFileSize
  }
});

// 统一的文件上传接口
router.post('/files', 
  authMiddleware,
  upload.array('fileList', 9), // 最多9个文件
  uploadController.uploadFiles
);

module.exports = router; 