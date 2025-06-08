const jwt = require('jsonwebtoken');
const APIResponse = require('../utils/api.response');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        message: '未提供认证令牌' 
      });
    }

    const decoded = jwt.verify(token, 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ 
      message: '无效的认证令牌' 
    });
  }
};

module.exports = authMiddleware; 