module.exports = {
  // 测试环境使用不同的端口，避免与开发环境冲突
  port: 3001,

  // 测试环境使用独立的数据库
  mongodb: {
    uri: 'mongodb://localhost:27017/monitor_test'  // 测试数据库URI
  },

  // 测试环境JWT配置
  jwt: {
    secret: 'test-secret-key',  // 测试环境使用固定的密钥
    expiresIn: '24h'
  },

  // 测试环境日志配置
  logger: {
    level: 'error',  // 测试环境只记录错误日志
    filename: 'logs/test-%DATE%.log',  // 测试日志使用独立的文件
    datePattern: 'YYYY-MM-DD',
    maxFiles: '7d'  // 测试日志保留7天
  },

  // 测试环境上传配置
  uploadDir: 'test-uploads',  // 测试文件使用独立的上传目录
  maxFileSize: 5 * 1024 * 1024,  // 文件大小限制（5MB）

  // 允许上传的文件类型配置
  allowedTypes: {
    image: ['.png', '.jpg', '.jpeg', '.gif', '.webp'],  // 图片格式
    audio: ['.mp3', '.wav', '.ogg'],  // 音频格式
    video: ['.mp4', '.webm', '.avi'],  // 视频格式
    document: ['.pdf', '.doc', '.docx']  // 文档格式
  }
}; 