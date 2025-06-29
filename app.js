require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const requestLogger = require('./src/middleware/logger.middleware');
const errorHandler = require('./src/middleware/error.middleware');

// 设置 mongoose strictQuery 选项
mongoose.set('strictQuery', false); // 或者设置为 true，取决于你的需求

const userRoutes = require('./src/routes/user.routes');
const uploadRoutes = require('./src/routes/upload.routes');
const logRoutes = require('./src/routes/log.routes');

const app = express();

// 基础中间件
app.use(cors());
app.use(bodyParser.json());
// 解析 application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// 请求日志中间件
app.use(requestLogger);

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API 路由
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/logs', logRoutes);

// 错误处理中间件
app.use(errorHandler);

// 只在非测试环境连接数据库
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect('mongodb://localhost:27017/app-monitor-backend', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log('Connected to MongoDB');
  }).catch((err) => {
    console.error('MongoDB connection error:', err);
  });
}

// 只在非测试环境启动服务器
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app; // 导出 app 以供测试使用 