const path = require('path');
const fs = require('fs').promises;
const config = require('../config');
const { v4: uuidv4 } = require('uuid');

class UploadService {
  constructor() {
    this.uploadDir = path.join(process.cwd(), config.uploadDir);
    this.ensureUploadDir();
  }

  async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  getFileType(extension) {
    for (const [type, extensions] of Object.entries(config.allowedTypes)) {
      if (extensions.includes(extension.toLowerCase())) {
        return type;
      }
    }
    return 'other';
  }

  async saveFile(file) {
    const extension = path.extname(file.originalname);
    const fileType = this.getFileType(extension);
    const fileName = `${uuidv4()}${extension}`;
    const filePath = path.join(this.uploadDir, fileName);
    
    // 确保文件类型目录存在
    const typeDir = path.join(this.uploadDir, fileType);
    await fs.mkdir(typeDir, { recursive: true });
    
    // 保存文件
    const finalPath = path.join(typeDir, fileName);
    await fs.writeFile(finalPath, file.buffer);

    // 返回文件信息
    return {
      url: `${config.baseUrl}/${config.uploadDir}/${fileType}/${fileName}`,
      fileName,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      type: fileType
    };
  }

  async validateFile(file) {
    const extension = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = [].concat(...Object.values(config.allowedTypes));
    
    if (!allowedExtensions.includes(extension)) {
      throw new Error('不支持的文件类型');
    }

    if (file.size > config.maxFileSize) {
      throw new Error(`文件大小不能超过${config.maxFileSize / 1024 / 1024}MB`);
    }
  }
}

module.exports = new UploadService(); 