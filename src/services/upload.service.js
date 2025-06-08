const path = require('path');
const fs = require('fs').promises;
const config = require('../config');
const { v4: uuidv4 } = require('uuid');
const Log = require('../models/log.model');

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

  async saveFile(file, options = {}) {
    const extension = path.extname(file.originalname);
    const fileType = this.getFileType(extension);
    const fileName = `${uuidv4()}${extension}`;
    
    // 确保文件类型目录存在
    const typeDir = path.join(this.uploadDir, fileType);
    await fs.mkdir(typeDir, { recursive: true });
    
    // 保存文件
    const finalPath = path.join(typeDir, fileName);
    await fs.writeFile(finalPath, file.buffer);

    const fileInfo = {
      url: `${config.baseUrl}/${config.uploadDir}/${fileType}/${fileName}`,
      fileName,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      type: fileType
    };

    // 如果是日志文件，创建日志记录
    if (options.isLog) {
      await this.createLogRecord(fileInfo, options);
    }

    return fileInfo;
  }

  async createLogRecord(fileInfo, options) {
    const {
      deviceId,
      metadata = {},
      userId
    } = options;

    const log = new Log({
      deviceId,
      metadata,
      fileUrl: fileInfo.url,
      fileName: fileInfo.originalName,
      fileSize: fileInfo.size,
      createdBy: userId
    });

    await log.save();
    return log;
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