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

// 上传路由
router.post('/image', auth, upload.single('file'), uploadController.uploadFile);
router.post('/archive', auth, upload.single('file'), uploadController.uploadFile);
router.delete('/:filename', auth, uploadController.deleteFile);

module.exports = router; 