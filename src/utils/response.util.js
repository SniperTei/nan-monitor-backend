class ResponseUtil {
  static success(data = null, msg = 'Success') {
    return {
      code: '000000',
      statusCode: 200,
      msg,
      data,
      timestamp: new Date().toISOString().replace('T', ' ').substr(0, 23)
    };
  }

  static error(code = 'A00001', msg = 'Error', statusCode = 400) {
    return {
      code,
      statusCode,
      msg,
      data: null,
      timestamp: new Date().toISOString().replace('T', ' ').substr(0, 23)
    };
  }
}

// 预定义错误码
ResponseUtil.ErrorCode = {
  PARAM_ERROR: 'A00001',
  USER_EXISTS: 'A00002',
  USER_NOT_FOUND: 'A00003',
  PASSWORD_ERROR: 'A00004',
  UNAUTHORIZED: 'A00005',
  SERVER_ERROR: 'A00500'
};

module.exports = ResponseUtil; 