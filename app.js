const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const requestLogger = require('./src/middleware/logger.middleware');
const errorHandler = require('./src/middleware/error.middleware');

const userRoutes = require('./src/routes/user.routes');
const uploadRoutes = require('./src/routes/upload.routes');

const app = express();

// 基础中间件
app.use(cors());
app.use(bodyParser.json());

// 请求日志中间件
app.use(requestLogger);

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API 路由
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/upload', uploadRoutes);

// 错误处理中间件
app.use(errorHandler);

// 连接MongoDB
mongoose.connect('mongodb://localhost:27017/app-monitor-backend', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 