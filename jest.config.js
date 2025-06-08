module.exports = {
  testEnvironment: 'node',
  testMatch: [
    "**/tests/**/*.test.js"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/src/config/",
    "/src/test/",
    ".*\\.config\\.js$"
  ],
  verbose: true
}; 