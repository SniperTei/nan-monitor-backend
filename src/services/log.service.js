const Log = require('../models/log.model');
const uploadService = require('./upload.service');

class LogService {
  async createLog(logData, file, userId) {
    let fileInfo = null;
    if (file) {
      fileInfo = await uploadService.saveFile(file);
    }

    const log = new Log({
      ...logData,
      fileUrl: fileInfo?.url,
      fileName: fileInfo?.originalName,
      fileSize: fileInfo?.size,
      createdBy: userId
    });

    await log.save();
    return log;
  }

  async getLogs(query) {
    const {
      deviceId,
      type,
      startTime,
      endTime,
      page = 1,
      limit = 10,
      sort = '-timestamp'
    } = query;

    const filter = {};

    if (deviceId) {
      filter.deviceId = deviceId;
    }
    if (type) {
      filter.type = type;
    }
    if (startTime || endTime) {
      filter.timestamp = {};
      if (startTime) {
        filter.timestamp.$gte = new Date(startTime);
      }
      if (endTime) {
        filter.timestamp.$lte = new Date(endTime);
      }
    }

    const total = await Log.countDocuments(filter);
    const logs = await Log.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'username nickname');

    return {
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getDeviceIds() {
    return await Log.distinct('deviceId');
  }

  async downloadLog(logId) {
    const log = await Log.findById(logId);
    if (!log || !log.fileUrl) {
      throw new Error('日志文件不存在');
    }
    return {
      url: log.fileUrl,
      fileName: log.fileName
    };
  }
}

module.exports = new LogService(); 