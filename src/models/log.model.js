const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: [true, '设备ID是必需的'],
    index: true
  },
  fileUrl: {
    type: String,
    required: [true, '文件URL是必需的']
  },
  fileName: {
    type: String,
    required: [true, '文件名是必需的']
  },
  fileSize: {
    type: Number,
    required: [true, '文件大小是必需的']
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// 创建复合索引
logSchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model('Log', logSchema); 