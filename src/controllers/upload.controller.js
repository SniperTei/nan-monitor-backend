const uploadService = require('../services/upload.service');
const logService = require('../services/log.service');
const APIResponse = require('../utils/api.response');

class UploadController {
  async uploadSingleFile(req, res) {
    try {
      if (!req.file) {
        return res.json(APIResponse.error('E00400', '请选择要上传的文件'));
      }

      const { deviceId, projectName, date, fileType } = req.body;
      const uploadType = req.path.split('/')[2]; // 获取 'image' 或 'archive'
      
      // 上传文件
      const result = await uploadService.uploadFile(req.file, uploadType);
      
      // 如果提供了 deviceId，创建日志记录
      if (deviceId) {
        try {
          await logService.createLog({
            deviceId,
            projectName,
            date: date || new Date().toISOString().split('T')[0],
            metadata: {
              fileType: fileType || uploadType,
              uploadType: 'single'
            }
          }, {
            url: result.url,
            originalName: result.originalname,
            size: result.size
          }, req.user?.id);
        } catch (logError) {
          console.error('创建日志失败:', logError);
          // 日志创建失败不影响文件上传结果
        }
      }
      
      return res.json(APIResponse.success(result, '上传成功'));
    } catch (error) {
      console.error('文件上传错误:', error);
      if (error.message === '不支持的文件类型') {
        return res.json(APIResponse.error('E00400', '不支持的文件类型'));
      }
      if (error.message === '文件大小超过限制') {
        return res.json(APIResponse.error('E00400', '文件大小超过限制'));
      }
      return res.json(APIResponse.serverError());
    }
  }

  async uploadMultipleFiles(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.json(APIResponse.error('E00400', '请选择要上传的文件'));
      }

      const { deviceId, projectName, date } = req.body;
      const fileType = req.path.split('/')[2];
      
      // 上传多个文件
      const results = await Promise.all(
        req.files.map(file => uploadService.uploadFile(file, fileType))
      );

      // 如果提供了 deviceId，为每个文件创建日志记录
      if (deviceId) {
        await Promise.all(
          req.files.map(file => 
            logService.createLog({
              deviceId,
              projectName,
              date: date || new Date().toISOString().split('T')[0],
              metadata: {
                fileType,
                uploadType: 'multiple'
              }
            }, file, req.user.id)
          )
        );
      }
      
      return res.json(APIResponse.success(results, '上传成功'));
    } catch (error) {
      if (error.message === '不支持的文件类型') {
        return res.json(APIResponse.error('E00400', '不支持的文件类型'));
      }
      if (error.message === '文件大小超过限制') {
        return res.json(APIResponse.error('E00400', '文件大小超过限制'));
      }
      return res.json(APIResponse.serverError());
    }
  }

  async deleteFile(req, res) {
    try {
      await uploadService.deleteFile(req.params.filename);
      return res.json(APIResponse.success(null, '删除成功'));
    } catch (error) {
      if (error.message === '文件不存在') {
        return res.json(APIResponse.error('E00404', '文件不存在'));
      }
      return res.json(APIResponse.serverError());
    }
  }
}

module.exports = new UploadController(); 