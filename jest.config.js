module.exports = {
  roots: [
    "<rootDir>"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
  ],
  collectCoverageFrom: [
    "./src/**/*.ts"
  ],
  coveragePathIgnorePatterns: [
    "/src/bin/"
  ],
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  testMatch: ["**/test/**/*.unit.[jt]s"],
  transform: {
    '^.+\\.ts$': ['ts-jest', { diagnostics: false }],
  },
  globalSetup: "./test/global.setup.ts",
  moduleNameMapper: {
    '^axios$': require.resolve('axios'),
    '^../../src/open-telemetry/openTelemetry.config$': '<rootDir>/src/open-telemetry/openTelemetry.config.ts',
    '^../../src/openTelemetry$': '<rootDir>/src/openTelemetry.ts',
  }
};
