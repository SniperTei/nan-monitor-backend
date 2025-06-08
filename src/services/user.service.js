const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const BusinessError = require('../errors/BusinessError');
const ErrorCodes = require('../constants/errorCodes');

class UserService {
  async register(userData) {
    const { username, email, password } = userData;

    // 检查用户名是否已存在
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw new BusinessError(ErrorCodes.USER_EXISTS, '用户名已存在');
    }

    // 如果提供了邮箱，检查邮箱是否已存在
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        throw new BusinessError(ErrorCodes.EMAIL_EXISTS, '邮箱已存在');
      }
    }

    // 创建新用户
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
      if (!user) {
        throw new BusinessError(ErrorCodes.INVALID_CREDENTIALS, '用户名或密码错误');
      }

      // 使用模型的方法比较密码
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new BusinessError(ErrorCodes.INVALID_CREDENTIALS, '用户名或密码错误');
      }

      // 生成 token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
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
      // 如果是业务错误直接抛出，否则包装为业务错误
      if (error instanceof BusinessError) {
        throw error;
      }
      throw new BusinessError(ErrorCodes.INVALID_CREDENTIALS, '用户名或密码错误');
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