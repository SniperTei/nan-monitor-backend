const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class UserService {
  async register(userData) {
    const { username, email, password } = userData;

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

    // 创建新用户，密码会通过中间件自动加密
    const user = new User({
      username,
      email,
      password,
      isAdmin: false,
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
    try {
      // 查找用户
      const user = await User.findOne({ username });
      console.log('查找到的用户:', {
        username: user?.username,
        hashedPassword: user?.password,
        inputPassword: password
      });

      if (!user) {
        throw new Error('用户名或密码错误');
      }

      // 使用模型的方法比较密码
      const isMatch = await user.comparePassword(password);
      console.log('密码比对结果:', {
        isMatch,
        inputPassword: password,
        storedHash: user.password
      });

      if (!isMatch) {
        throw new Error('用户名或密码错误');
      }

      // 生成 token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'your-secret-key', // 添加默认值，避免环境变量未设置
        { expiresIn: '24h' }
      );

      return {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin
        }
      };
    } catch (error) {
      console.error('登录错误:', error);
      throw new Error('用户名或密码错误');
    }
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