module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globalSetup: "./src/db/testSetup.ts"
};
