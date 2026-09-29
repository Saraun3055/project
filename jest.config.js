module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-redux|@reduxjs/toolkit|redux|immer|@react-native-async-storage|react-native-safe-area-context)/)',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
};
