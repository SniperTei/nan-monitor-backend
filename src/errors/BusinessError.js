class BusinessError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = 'BusinessError';
  }
}

module.exports = BusinessError; 