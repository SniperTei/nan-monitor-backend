const userService = require('../services/user.service');
const ResponseUtil = require('../utils/response.util');

class UserController {
  async register(req, res) {
    try {
      const { username, password, email } = req.body;
      
      // 添加参数验证
      if (!username || !password) {
        return res.json(ResponseUtil.error(
          ResponseUtil.ErrorCode.PARAM_ERROR,
          '用户名和密码不能为空',
          400
        ));
      }

      // 验证用户名长度
      if (username.length < 3 || username.length > 20) {
        return res.json(ResponseUtil.error(
          ResponseUtil.ErrorCode.PARAM_ERROR,
          '用户名长度必须在3-20个字符之间',
          400
        ));
      }

      // 验证密码长度
      if (password.length < 6) {
        return res.json(ResponseUtil.error(
          ResponseUtil.ErrorCode.PARAM_ERROR,
          '密码长度不能少于6个字符',
          400
        ));
      }

      // 验证邮箱格式（如果提供了邮箱）
      if (email && !email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
        return res.json(ResponseUtil.error(
          ResponseUtil.ErrorCode.PARAM_ERROR,
          '邮箱格式不正确',
          400
        ));
      }

      const user = await userService.register(req.body);
      res.json(ResponseUtil.success(
        { userId: user._id },
        '注册成功'
      ));
    } catch (error) {
      if (error.message === '用户名或邮箱已存在') {
        res.json(ResponseUtil.error(
          ResponseUtil.ErrorCode.USER_EXISTS,
          error.message,
          400
        ));
      } else {
        res.json(ResponseUtil.error(
          ResponseUtil.ErrorCode.SERVER_ERROR,
          '服务器内部错误',
          500
        ));
      }
    }
  }

  async login(req, res) {
    try {
      // 添加调试日志
      console.log('Login request:', {
        headers: req.headers,
        body: req.body,
        contentType: req.headers['content-type']
      });

      const { username, password } = req.body;
      
      // 添加参数验证
      if (!username || !password) {
        return res.json(ResponseUtil.error(
          ResponseUtil.ErrorCode.PARAM_ERROR,
          '用户名和密码不能为空',
          400
        ));
      }

      const result = await userService.login(username, password);
      res.json(ResponseUtil.success(result, '登录成功'));
    } catch (error) {
      if (error.message === '用户不存在' || error.message === '密码错误') {
        res.json(ResponseUtil.error(
          ResponseUtil.ErrorCode.PASSWORD_ERROR,
          '用户名或密码错误', // 统一错误提示，提高安全性
          401
        ));
      } else {
        res.json(ResponseUtil.error(
          ResponseUtil.ErrorCode.SERVER_ERROR,
          '服务器内部错误',
          500
        ));
      }
    }
  }

  async getProfile(req, res) {
    try {
      const user = await userService.getUserById(req.userId);
      res.json(ResponseUtil.success({
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
      res.json(ResponseUtil.error(
        ResponseUtil.ErrorCode.USER_NOT_FOUND,
        '用户不存在',
        404
      ));
    }
  }

  async updateProfile(req, res) {
    try {
      const { email, nickname, avatarUrl, isAdmin } = req.body;

      // 验证邮箱格式（如果提供了邮箱）
      if (email && !email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
        return res.json(ResponseUtil.error(
          ResponseUtil.ErrorCode.PARAM_ERROR,
          '邮箱格式不正确',
          400
        ));
      }

      // 验证昵称长度（如果提供了昵称）
      if (nickname && (nickname.length < 1 || nickname.length > 30)) {
        return res.json(ResponseUtil.error(
          ResponseUtil.ErrorCode.PARAM_ERROR,
          '昵称长度必须在1-30个字符之间',
          400
        ));
      }

      // 检查是否有权限修改管理员状态
      if (isAdmin !== undefined) {
        const currentUser = await userService.getUserById(req.userId);
        if (!currentUser.isAdmin) {
          return res.json(ResponseUtil.error(
            ResponseUtil.ErrorCode.FORBIDDEN,
            '没有权限修改管理员状态',
            403
          ));
        }
      }

      const user = await userService.updateUser(
        req.userId,
        req.body,
        req.userId
      );
      
      res.json(ResponseUtil.success({
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
        res.json(ResponseUtil.error(
          ResponseUtil.ErrorCode.USER_NOT_FOUND,
          error.message,
          404
        ));
      } else {
        res.json(ResponseUtil.error(
          ResponseUtil.ErrorCode.SERVER_ERROR,
          '服务器内部错误',
          500
        ));
      }
    }
  }
}

module.exports = new UserController(); 