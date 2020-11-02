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
  testRegex: "(/__test__/.*|(\\.|/))\\.test.(tsx|ts|js|jsx)?$",
  "setupFilesAfterEnv": [
    "<rootDir>/jest.setup.js"
  ]
};