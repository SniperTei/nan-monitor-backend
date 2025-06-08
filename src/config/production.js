module.exports = {
  port: process.env.PORT || 3000,
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/monitor_prod'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'production-secret-key',
    expiresIn: '24h'
  },
  logger: {
    level: 'info',
    filename: 'logs/app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '30d'
  },
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB
  allowedTypes: {
    image: ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    audio: ['.mp3', '.wav', '.ogg'],
    video: ['.mp4', '.webm', '.avi'],
    document: ['.pdf', '.doc', '.docx']
  }
}; 