const userService = require('../services/user.service');
const APIResponse = require('../utils/api.response');
const BusinessError = require('../errors/BusinessError');

class UserController {
  async register(req, res) {
    try {
      const { username, password, email } = req.body;
      
      // 添加参数验证
      if (!username || !password) {
        return res.json(APIResponse.paramError('用户名和密码不能为空'));
      }

      // 验证用户名长度
      if (username.length < 3 || username.length > 20) {
        return res.json(APIResponse.paramError('用户名长度必须在3-20个字符之间'));
      }

      // 验证密码长度
      if (password.length < 6) {
        return res.json(APIResponse.paramError('密码长度不能少于6个字符'));
      }

      // 验证邮箱格式
      if (email && !email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
        return res.json(APIResponse.paramError('邮箱格式不正确'));
      }

      const user = await userService.register(req.body);
      return res.json(APIResponse.success({
        userId: user._id,
        username: user.username
      }, '注册成功'));
    } catch (error) {
      if (error instanceof BusinessError) {
        return res.json(APIResponse.error(error.code, error.message));
      } else {
        return res.json(APIResponse.serverError());
      }
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.json(APIResponse.paramError('用户名和密码不能为空'));
      }

      const result = await userService.login(username, password);
      return res.json(APIResponse.success(result, '登录成功'));
    } catch (error) {
      // 统一处理登录错误
      if (error.message === '用户名或密码错误') {
        return res.json(APIResponse.passwordError('用户名或密码错误'));
      }
      // 其他未预期的错误才返回服务器错误
      return res.json(APIResponse.serverError());
    }
  }

  async getProfile(req, res) {
    try {
      const user = await userService.getUserById(req.userId);
      return res.json(APIResponse.success({
        id: user._id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        createdBy: user.createdBy,
        updatedBy: user.updatedBy
      }));
    } catch (error) {
      return res.json(APIResponse.userNotFound());
    }
  }

  async updateProfile(req, res) {
    try {
      const { email, nickname, avatarUrl, isAdmin } = req.body;

      if (email && !email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
        return res.json(APIResponse.paramError('邮箱格式不正确'));
      }

      if (nickname && (nickname.length < 1 || nickname.length > 30)) {
        return res.json(APIResponse.paramError('昵称长度必须在1-30个字符之间'));
      }

      if (isAdmin !== undefined) {
        const currentUser = await userService.getUserById(req.userId);
        if (!currentUser.isAdmin) {
          return res.json(APIResponse.forbidden());
        }
      }

      const user = await userService.updateUser(req.userId, req.body, req.userId);
      return res.json(APIResponse.success({
        id: user._id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }, '更新成功'));
    } catch (error) {
      if (error.message === '用户不存在') {
        return res.json(APIResponse.userNotFound());
      }
      return res.json(APIResponse.serverError());
    }
  }
}

module.exports = new UserController(); 