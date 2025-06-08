const express = require('express');
const router = express.Router();
const multer = require('multer');
const logController = require('../controllers/log.controller');
const authMiddleware = require('../middleware/auth.middleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: require('../config').maxFileSize
  }
});

// 上传日志（支持可选的文件附件）
router.post('/', 
  authMiddleware,
  upload.single('file'),
  logController.uploadLog
);

// 获取日志列表
router.get('/',
  authMiddleware,
  logController.getLogs
);

// 获取所有设备ID
router.get('/devices',
  authMiddleware,
  logController.getDeviceIds
);

// 下载日志文件
router.get('/:logId/download',
  authMiddleware,
  logController.downloadLog
);

module.exports = router; 