const mongoose = require('mongoose');

const crashSchema = new mongoose.Schema({
  appVersion: String,
  deviceInfo: {
    model: String,
    os: String,
    osVersion: String
  },
  errorMessage: String,
  stackTrace: String,
  timestamp: { type: Date, default: Date.now },
  userId: String
});

module.exports = mongoose.model('Crash', crashSchema); 