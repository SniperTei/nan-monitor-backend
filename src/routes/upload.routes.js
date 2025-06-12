const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/upload.controller');
const auth = require('../middleware/auth.middleware');
const config = require('../config');
const path = require('path');

// 配置 multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.maxFileSize
  }
});

// 单文件上传路由
router.post('/single/image', auth, upload.single('file'), uploadController.uploadSingleFile);
router.post('/single/archive', auth, upload.single('file'), uploadController.uploadSingleFile);

// 多文件上传路由
router.post('/multiple/image', auth, upload.array('files', 10), uploadController.uploadMultipleFiles);
router.post('/multiple/archive', auth, upload.array('files', 10), uploadController.uploadMultipleFiles);

// 删除文件路由
router.delete('/:filename', auth, uploadController.deleteFile);

module.exports = router; 