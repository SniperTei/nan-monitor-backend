const logService = require('../services/log.service');
const APIResponse = require('../utils/api.response');

class LogController {
  async uploadLog(req, res) {
    try {
      const log = await logService.createLog(
        req.body,
        req.file,
        req.userId
      );
      
      res.json(ResponseUtil.success(log, '日志上传成功'));
    } catch (error) {
      res.json(ResponseUtil.error(
        ResponseUtil.ErrorCode.PARAM_ERROR,
        error.message,
        400
      ));
    }
  }

  async getLogs(req, res) {
    try {
      const result = await logService.getLogs(req.query);
      res.json(APIResponse.success(result));
    } catch (error) {
      res.json(APIResponse.error('E00500', error.message));
    }
  }

  async getDeviceIds(req, res) {
    try {
      const deviceIds = await logService.getDeviceIds();
      res.json(ResponseUtil.success(deviceIds));
    } catch (error) {
      res.json(ResponseUtil.error(
        ResponseUtil.ErrorCode.SERVER_ERROR,
        error.message,
        500
      ));
    }
  }

  async downloadLog(req, res) {
    try {
      const { logId } = req.params;
      const fileInfo = await logService.downloadLog(logId);
      res.json(ResponseUtil.success(fileInfo));
    } catch (error) {
      res.json(ResponseUtil.error(
        ResponseUtil.ErrorCode.PARAM_ERROR,
        error.message,
        400
      ));
    }
  }
}

module.exports = new LogController(); 