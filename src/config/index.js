const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    baseUrl: 'http://localhost:3000',
    uploadDir: 'uploads',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: {
      image: ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      audio: ['.mp3', '.wav', '.ogg'],
      video: ['.mp4', '.webm', '.avi'],
      document: ['.pdf', '.doc', '.docx']
    }
  },
  production: {
    baseUrl: 'https://api.yourdomain.com',
    uploadDir: 'uploads',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: {
      image: ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      audio: ['.mp3', '.wav', '.ogg'],
      video: ['.mp4', '.webm', '.avi'],
      document: ['.pdf', '.doc', '.docx']
    }
  }
};

module.exports = config[env]; 