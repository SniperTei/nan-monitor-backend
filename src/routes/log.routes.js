const express = require('express');
const router = express.Router();
const logController = require('../controllers/log.controller');
const authMiddleware = require('../middleware/auth.middleware');

// 获取日志列表（支持按设备ID和日期筛选）
router.get('/',
  authMiddleware,
  logController.getLogs
);

module.exports = router; 