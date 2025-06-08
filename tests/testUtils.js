const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../src/models/user.model');
const config = require('../src/config');

/**
 * 创建测试用户
 * @returns {Promise<Object>} 创建的测试用户对象
 */
async function createTestUser() {
  const hashedPassword = await bcrypt.hash('test123', 10);
  const testUser = new User({
    username: 'testuser',
    password: hashedPassword,
    email: 'test@example.com',
    isAdmin: false
  });
  await testUser.save();
  return testUser;
}

/**
 * 获取测试用户的JWT token
 * @param {Object} user 用户对象
 * @returns {Promise<string>} JWT token
 */
async function getTestUserToken(user) {
  return jwt.sign(
    { userId: user._id.toString() },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

module.exports = {
  createTestUser,
  getTestUserToken
}; 