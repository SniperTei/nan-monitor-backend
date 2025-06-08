module.exports = {
  port: 3001,
  mongodb: {
    uri: 'mongodb://localhost:27017/monitor_test'
  },
  jwt: {
    secret: 'test-secret-key',
    expiresIn: '24h'
  },
  logger: {
    level: 'error',
    filename: 'logs/test-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '7d'
  },
  uploadDir: 'test-uploads',
  maxFileSize: 5 * 1024 * 1024,
  allowedTypes: {
    image: ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    audio: ['.mp3', '.wav', '.ogg'],
    video: ['.mp4', '.webm', '.avi'],
    document: ['.pdf', '.doc', '.docx']
  }
}; 