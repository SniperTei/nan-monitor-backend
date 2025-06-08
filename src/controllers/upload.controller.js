const uploadService = require('../services/upload.service');
const ResponseUtil = require('../utils/response.util');

class UploadController {
  async uploadFiles(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.json(ResponseUtil.error(
          'A00001',
          '请选择要上传的文件',
          400
        ));
      }

      if (req.files.length > 9) {
        return res.json(ResponseUtil.error(
          'A00001',
          '最多只能上传9个文件',
          400
        ));
      }

      const results = [];
      for (const file of req.files) {
        await uploadService.validateFile(file);
        
        // 检查是否是日志文件上传
        const isLog = req.body.fileType === 'log';
        const fileInfo = await uploadService.saveFile(file, {
          isLog,
          deviceId: req.body.deviceId,
          logType: req.body.logType,
          content: req.body.content,
          metadata: req.body.metadata ? JSON.parse(req.body.metadata) : {},
          userId: req.userId
        });
        
        results.push(fileInfo);
      }

      res.json(ResponseUtil.success(results, '文件上传成功'));
    } catch (error) {
      res.json(ResponseUtil.error(
        'A00001',
        error.message,
        400
      ));
    }
  }
}

module.exports = new UploadController(); 