const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

class UserService {
  async register(userData) {
    const { username, email } = userData;

    // 检查用户名是否已存在
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw new Error('用户名已存在');
    }

    // 如果提供了邮箱，检查邮箱是否已存在
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        throw new Error('邮箱已存在');
      }
    }

    // 创建新用户
    const user = new User({
      ...userData,
      // 如果是第一个用户，设置为自己创建
      createdBy: null,
      updatedBy: null
    });

    await user.save();
    
    // 如果是第一个用户，更新创建者和更新者为自己
    if ((await User.countDocuments()) === 1) {
      user.createdBy = user._id;
      user.updatedBy = user._id;
      await user.save();
    }
    
    return user;
  }

  async login(username, password) {
    // 查找用户
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error('用户名或密码错误');
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('用户名或密码错误');
    }

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user._id },
      'your-secret-key',
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      }
    };
  }

  async getUserById(userId) {
    const user = await User.findById(userId)
      .populate('createdBy', 'username nickname')
      .populate('updatedBy', 'username nickname');
      
    if (!user) {
      throw new Error('用户不存在');
    }
    return user;
  }

  async updateUser(userId, updateData, operatorId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 更新允许的字段
    const allowedFields = ['nickname', 'email', 'avatarUrl'];
    // 如果操作者是管理员，允许更新 isAdmin 字段
    const operator = await User.findById(operatorId);
    if (operator && operator.isAdmin) {
      allowedFields.push('isAdmin');
    }

    allowedFields.forEach(field => {
      if (field in updateData) {
        user[field] = updateData[field];
      }
    });

    user.updatedBy = operatorId;
    await user.save();

    return user;
  }
}

module.exports = new UserService(); 