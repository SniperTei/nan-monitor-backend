module.exports = {
  // HTTP服务器监听端口
  port: 3000,

  // MongoDB数据库配置
  mongodb: {
    uri: 'mongodb://localhost:27017/monitor_dev'  // 开发环境数据库连接URI
  },

  // JWT（JSON Web Token）配置
  jwt: {
    secret: 'your-secret-key',  // JWT签名密钥，用于token的生成和验证
    expiresIn: '24h'  // token有效期为24小时
  },

  // 日志配置
  logger: {
    level: 'debug',  // 日志级别：开发环境使用debug级别，记录所有日志
    filename: 'logs/app-%DATE%.log',  // 日志文件名格式，%DATE%会被替换为实际日期
    datePattern: 'YYYY-MM-DD',  // 日志文件日期格式
    maxFiles: '14d'  // 日志文件保留14天
  },

  // 文件上传配置
  uploadDir: 'uploads',  // 上传文件存储目录
  maxFileSize: 5 * 1024 * 1024,  // 单个文件最大大小限制（5MB）

  // 允许上传的文件类型配置
  allowedTypes: {
    image: ['.png', '.jpg', '.jpeg', '.gif', '.webp'],  // 允许的图片格式
    audio: ['.mp3', '.wav', '.ogg'],  // 允许的音频格式
    video: ['.mp4', '.webm', '.avi'],  // 允许的视频格式
    document: ['.pdf', '.doc', '.docx'],  // 允许的文档格式
    archive: ['.zip', '.rar', '.7z']  // 添加压缩文件类型
  }
}; 