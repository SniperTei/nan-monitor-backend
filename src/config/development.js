module.exports = {
  port: 3000,
  mongodb: {
    uri: 'mongodb://localhost:27017/monitor_dev'
  },
  jwt: {
    secret: 'your-secret-key',
    expiresIn: '24h'
  },
  logger: {
    level: 'debug',
    filename: 'logs/app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d'
  },
  uploadDir: 'uploads',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: {
    image: ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    audio: ['.mp3', '.wav', '.ogg'],
    video: ['.mp4', '.webm', '.avi'],
    document: ['.pdf', '.doc', '.docx']
  }
}; 