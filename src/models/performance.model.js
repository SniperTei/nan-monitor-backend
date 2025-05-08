const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  appVersion: String,
  metrics: {
    memoryUsage: Number,
    cpuUsage: Number,
    fps: Number
  },
  timestamp: { type: Date, default: Date.now },
  userId: String
});

module.exports = mongoose.model('Performance', performanceSchema); 