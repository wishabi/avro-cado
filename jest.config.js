module.exports = {
  globals: {
    "ts-jest": {
      "diagnostics": {
        "warnOnly": true
      }
    }
  },
  moduleFileExtensions: ["ts", "tsx", "js", "json"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  testMatch: ["**/test/**/*.test.(ts|js)"],
  testEnvironment: "node",
  modulePaths: ["<rootDir>/node_modules", "<rootDir>/ts"],
  collectCoverage: true,
  collectCoverageFrom: ["!ts/examples/**", "!ts/index.ts", "ts/**/*.{ts}"],
  unmockedModulePathPatterns: ["<rootDir>/node_modules"]
};
