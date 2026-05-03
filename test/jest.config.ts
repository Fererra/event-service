import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "..",
  testMatch: ["<rootDir>/test/modules/**/*.test.ts"],
  testPathIgnorePatterns: ["/test\/modules\/.*\/integration\//"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.test.json",
      },
    ],
  },
  collectCoverageFrom: [
    "<rootDir>/src/modules/**/domain/**/*.ts",
    "<rootDir>/src/modules/**/application/**/*.ts",
    "!**/*.d.ts",
  ],
  coverageDirectory: "<rootDir>/coverage",
};

export default config;
