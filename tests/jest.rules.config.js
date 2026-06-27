/**
 * Dedicated Jest configuration for Firestore rules tests.
 * Uses a custom resolver to work around unrs-resolver native binding failure.
 */
module.exports = {
  testEnvironment: 'node',
  rootDir: require('path').resolve(__dirname, '..'),
  testMatch: ['<rootDir>/tests/firestore.rules.test.js'],
  resolver: '<rootDir>/tests/jest-custom-resolver.js',
  transform: {},
};
