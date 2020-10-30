module.exports = {
  collectCoverage: true,
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: [
    "<rootDir>/examples/", 
    "<rootDir>/__test__/basic/",
    "<rootDir>/__test__/utils/"
  ],
  preset: 'ts-jest',
  transform: { '^.+\\.(tsx|ts|js|jsx)?$': 'ts-jest'},
  testEnvironment: "node",
  clearMocks: true,
  cache: false,
  testURL: "http://localhost",
  "testMatch": [
    "**/__test__/**/Provider.test.tsx",
    "**/__test__/**/createStore.test.tsx",
    "**/__test__/**/applyMiddleware.test.ts",
    "**/__test__/**/infoLog.test.ts",
    "**/__test__/**/ifType.test.ts",
    "**/__test__/**/shallowEqual.test.ts"
  ],
  "setupFilesAfterEnv": [
    "<rootDir>/jest.setup.js"
  ]
};