const express = require('express');
const router = express.Router();
const Crash = require('../models/crash.model');

router.post('/report', async (req, res) => {
  try {
    const crash = new Crash(req.body);
    await crash.save();
    res.status(201).json({ message: 'Crash report saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/list', async (req, res) => {
  try {
    const crashes = await Crash.find().sort({ timestamp: -1 });
    res.json(crashes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 