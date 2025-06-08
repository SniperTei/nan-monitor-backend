const uploadService = require('../services/upload.service');
const APIResponse = require('../utils/api.response');

class UploadController {
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.json(APIResponse.error('E00400', '请选择要上传的文件'));
      }

      const result = await uploadService.uploadFile(req.file, 'image');
      return res.json(APIResponse.success(result, '上传成功'));
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