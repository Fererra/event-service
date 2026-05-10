import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "..",
  testMatch: ["<rootDir>/test/modules/**/integration/**/*.endpoints.test.ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.test.json" }],
  },
  testTimeout: 30000,
  setupFiles: ["<rootDir>/test/shared/setup-env.ts"],
  globalSetup: "<rootDir>/test/shared/global-setup.ts",
  globalTeardown: "<rootDir>/test/shared/global-teardown.ts",
};

export default config;
