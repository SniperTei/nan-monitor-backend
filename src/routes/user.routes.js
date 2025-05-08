const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

// 注册路由
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: '用户名或邮箱已存在' 
      });
    }

    // 创建新用户
    const user = new User({
      username,
      password,
      email
    });

    await user.save();

    res.status(201).json({ 
      message: '注册成功' 
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// 登录路由
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 查找用户
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ 
        message: '用户名或密码错误' 
      });
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: '用户名或密码错误' 
      });
    }

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user._id },
      'your-secret-key', // 在实际应用中应该使用环境变量
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
});

module.exports = router; 