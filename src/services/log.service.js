const Log = require('../models/log.model');
const uploadService = require('./upload.service');

class LogService {
  async createLog(logData, fileInfo, userId) {
    try {
      const log = new Log({
        deviceId: logData.deviceId,
        date: logData.date,
        fileUrl: fileInfo?.url || '',
        fileName: fileInfo?.originalName || '',
        fileSize: fileInfo?.size || 0,
        metadata: logData.metadata || {},
        createdBy: userId
      });

      await log.save();
      return log;
    } catch (error) {
      console.error('创建日志记录失败:', error);
      throw error;
    }
  }

  async getLogs(query) {
    const { deviceId, date, page = 1, limit = 10 } = query;

    const filter = {};

    if (deviceId) {
      filter.deviceId = deviceId;
    }
    if (date) {
      // 查询指定日期的日志
      filter.date = date;
    }

    const total = await Log.countDocuments(filter);
    const logs = await Log.find(filter)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .select('deviceId date fileUrl fileName fileSize metadata createdAt');

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