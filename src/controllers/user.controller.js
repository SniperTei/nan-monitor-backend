const userService = require('../services/user.service');
const ResponseUtil = require('../utils/response.util');

class UserController {
  async register(req, res) {
    try {
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
          ResponseUtil.ErrorCode.PARAM_ERROR,
          error.message,
          400
        ));
      }
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;
      const result = await userService.login(username, password);
      res.json(ResponseUtil.success(result, '登录成功'));
    } catch (error) {
      res.json(ResponseUtil.error(
        ResponseUtil.ErrorCode.USER_NOT_FOUND,
        error.message,
        401
      ));
    }
  }

  async getProfile(req, res) {
    try {
      const user = await userService.getUserById(req.userId);
      res.json(ResponseUtil.success({
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }));
    } catch (error) {
      res.json(ResponseUtil.error(
        ResponseUtil.ErrorCode.USER_NOT_FOUND,
        error.message,
        404
      ));
    }
  }

  async updateProfile(req, res) {
    try {
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
      res.json(ResponseUtil.error(
        ResponseUtil.ErrorCode.PARAM_ERROR,
        error.message,
        400
      ));
    }
  }
}

module.exports = new UserController(); 