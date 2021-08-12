module.exports = {
  roots: ['<rootDir>/src'],
  verbose: true,
  transform: {
    '^.+\\.ts?$': 'ts-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*(test))\\.[jt]s?$',
  testPathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/node_modules/',
    '<rootDir>/../../node_modules/',
  ],
  // testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleDirectories: ['node_modules', '../../node_modules'],
  testURL: 'http://localhost/',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleNameMapper: {
    '^jose/(.*)$': '<rootDir>/../../node_modules/jose/dist/node/cjs/$1',
  },
};
