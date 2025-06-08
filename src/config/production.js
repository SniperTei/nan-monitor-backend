module.exports = {
  // HTTP服务器监听端口，优先使用环境变量
  port: process.env.PORT || 3000,

  // MongoDB数据库配置
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/monitor_prod'  // 生产环境数据库连接URI
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'production-secret-key',  // 生产环境JWT密钥，强烈建议使用环境变量
    expiresIn: '24h'  // token有效期为24小时
  },

  // 日志配置
  logger: {
    level: 'info',  // 日志级别：生产环境使用info级别，减少日志量
    filename: 'logs/app-%DATE%.log',  // 日志文件名格式
    datePattern: 'YYYY-MM-DD',  // 日志文件日期格式
    maxFiles: '30d'  // 生产环境日志保留30天
  },

  // 文件上传配置，支持通过环境变量自定义
  uploadDir: process.env.UPLOAD_DIR || 'uploads',  // 上传目录
  maxFileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024,  // 文件大小限制（5MB）

  // 允许上传的文件类型配置
  allowedTypes: {
    image: ['.png', '.jpg', '.jpeg', '.gif', '.webp'],  // 图片格式
    audio: ['.mp3', '.wav', '.ogg'],  // 音频格式
    video: ['.mp4', '.webm', '.avi'],  // 视频格式
    document: ['.pdf', '.doc', '.docx']  // 文档格式
  }
}; 