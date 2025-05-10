const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const config = require('../config');

// 创建日志目录
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 创建请求日志写入流
const accessLogStream = fs.createWriteStream(
  path.join(logDir, 'access.log'),
  { flags: 'a' }
);

// 自定义日志格式
morgan.token('body', (req) => JSON.stringify(req.body));
morgan.token('params', (req) => JSON.stringify(req.params));
morgan.token('query', (req) => JSON.stringify(req.query));
morgan.token('response-body', (req, res) => {
  if (res._responseBody) {
    return JSON.stringify(res._responseBody);
  }
  return '';
});

// 开发环境日志格式
const devLogFormat = `
:date[iso] [:method] :url
Headers: :req[authorization]
Params: :params
Query: :query
Body: :body
Response: :response-body
Status: :status
Time: :response-time ms
`;

// 生产环境日志格式（更简洁）
const prodLogFormat = ':date[iso] [:method] :url :status :response-time ms';

// 创建日志中间件
const requestLogger = (req, res, next) => {
  // 捕获响应体
  const oldSend = res.json;
  res.json = function(body) {
    res._responseBody = body;
    return oldSend.call(this, body);
  };

  // 根据环境选择日志格式
  const format = process.env.NODE_ENV === 'production' ? prodLogFormat : devLogFormat;

  // 同时写入控制台和文件
  morgan(format, {
    stream: {
      write: (message) => {
        // 移除多余的换行符
        const cleanMessage = message.replace(/\n+/g, '\n').trim();
        console.log(cleanMessage);
        accessLogStream.write(cleanMessage + '\n');
      }
    },
    skip: (req) => {
      // 跳过对静态文件的日志记录
      return req.url.startsWith('/uploads/');
    }
  })(req, res, next);
};

module.exports = requestLogger; 