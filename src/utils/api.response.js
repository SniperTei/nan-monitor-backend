class APIResponse {
  constructor(code = '000000', msg = 'Success', data = null, statusCode = 200) {
    this.code = code;
    this.statusCode = statusCode;
    this.msg = msg;
    this.data = data;
    this.timestamp = new Date().toISOString().replace('T', ' ').substr(0, 23);
  }

  static success(data = null, msg = 'Success') {
    return new APIResponse('000000', msg, data, 200);
  }

  static error(code, msg, statusCode = 400) {
    return new APIResponse(code, msg, null, statusCode);
  }

  // 预定义错误响应
  static paramError(msg = '参数错误') {
    return this.error('E00001', msg, 400);
  }

  static userExists(msg = '用户已存在') {
    return this.error('E00002', msg, 400);
  }

  static userNotFound(msg = '用户不存在') {
    return this.error('E00003', msg, 404);
  }

  static passwordError(msg = '密码错误') {
    return this.error('E00004', msg, 401);
  }

  static unauthorized(msg = '未授权访问') {
    return this.error('E00401', msg, 401);
  }

  static forbidden(msg = '权限不足') {
    return this.error('E00403', msg, 403);
  }

  static notFound(msg = '资源不存在') {
    return this.error('E00404', msg, 404);
  }

  static serverError(msg = '服务器内部错误') {
    return this.error('E00500', msg, 500);
  }
}

module.exports = APIResponse; 