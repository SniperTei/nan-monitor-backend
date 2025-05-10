const ResponseUtil = require('../utils/response.util');
const fs = require('fs');
const path = require('path');

// 创建错误日志文件
const errorLogStream = fs.createWriteStream(
  path.join(process.cwd(), 'logs', 'error.log'),
  { flags: 'a' }
);

const logError = (err, req) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      params: req.params,
      query: req.query,
      body: req.body
    }
  };

  // 写入错误日志文件
  errorLogStream.write(JSON.stringify(errorLog) + '\n');
  
  // 开发环境下在控制台输出详细错误信息
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', errorLog);
  }
};

const errorHandler = (err, req, res, next) => {
  // 记录错误日志
  logError(err, req);

  // MongoDB 重复键错误
  if (err.code === 11000) {
    return res.json(ResponseUtil.error(
      ResponseUtil.ErrorCode.USER_EXISTS,
      '用户名或邮箱已存在',
      400
    ));
  }

  // MongoDB 验证错误
  if (err.name === 'ValidationError') {
    return res.json(ResponseUtil.error(
      ResponseUtil.ErrorCode.PARAM_ERROR,
      Object.values(err.errors).map(e => e.message).join(', '),
      400
    ));
  }

  // JWT 验证错误
  if (err.name === 'JsonWebTokenError') {
    return res.json(ResponseUtil.error(
      ResponseUtil.ErrorCode.UNAUTHORIZED,
      '无效的认证令牌',
      401
    ));
  }

  // 默认服务器错误
  return res.json(ResponseUtil.error(
    ResponseUtil.ErrorCode.SERVER_ERROR,
    '服务器内部错误',
    500
  ));
};

module.exports = errorHandler; 