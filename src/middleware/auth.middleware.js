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
    req.user = {
      id: decoded.userId,
      // ... 其他用户信息
    };
    next();
  } catch (error) {
    console.error('认证错误:', error);
    return res.json(APIResponse.error('E00401', '认证失败'));
  }
};

module.exports = authMiddleware; 