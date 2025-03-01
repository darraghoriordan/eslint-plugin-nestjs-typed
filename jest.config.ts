import type {Config} from "@jest/types";

const config: Config.InitialOptions = {
    cacheDirectory: `${__dirname}/.jest_cache`,
    roots: ["<rootDir>/src"],
    preset: "ts-jest",
    testRegex: "(.*.(test|spec)).(jsx?|tsx?|ts?)$",

    moduleFileExtensions: ["ts", "js", "json"],
    setupFiles: ["./src/testing/preRun.ts"],
    collectCoverage: true,
    transform: {
        "^.+\\.(tsx?|ts?)$": ["ts-jest", {tsconfig: `tsconfig.test.json`}],
    },
    // transformIgnorePatterns: ["node_modules/(?!(cliui|string-width)/)"],
    silent: false,
    verbose: true,
    collectCoverageFrom: [
        "**/src/**/*.ts",
        "!**/node_modules/**",
        "!**/*.test.data.ts",
    ],
    coverageThreshold: {
        global: {
            statements: 0,
            branches: 0,
            functions: 0,
            lines: 0,
        },
    },
    reporters: [
        "default",
        [
            "jest-junit",
            {
                outputName: "junit-TEST.xml",
            },
        ],
    ],
    coveragePathIgnorePatterns: [
        ".*test\\.data\\.ts$,migrations.*.ts$,(.*.(test|spec)).(jsx?|tsx?)$,(tests/.*.mock).(jsx?|tsx?)$",
    ],
    coverageReporters: ["json", "lcov", "text", "clover", "cobertura"],
};

export default config;
