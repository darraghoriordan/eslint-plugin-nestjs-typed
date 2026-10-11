import rule from "./injectableShouldBeProvided.js";
import {RuleTester} from "@typescript-eslint/rule-tester";
import {Linter} from "eslint";
import parser from "@typescript-eslint/parser";

import {getFixturesRootDirectory} from "../../testing/fixtureSetup.js";
import path from "path";
import fs from "fs";
import os from "os";
import {afterAll, describe, expect, it} from "vitest";

const tsRootDirectory = getFixturesRootDirectory();
const fixturesGlob = path
    .join(tsRootDirectory, "*.ts")
    .split(path.sep)
    .join("/");

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            ecmaVersion: 2015,
            tsconfigRootDir: tsRootDirectory,
            project: "tsconfig-withMeta.json",
            allowDefaultProject: false,
        },
    },
});

ruleTester.run("injectable-should-be-provided", rule, {
    valid: [
        {
            // I've added a reference to this provider in the /fixtures/example.module.ts file so
            // it should not error
            code: `
            import {Injectable} from "./Injectable.stub";

            @Injectable()
            class ExampleProviderIncludedInModule {}

            export default ExampleProviderIncludedInModule;
            `,
            options: [
                {
                    src: [fixturesGlob],
                    filterFromPaths: [
                        "node_modules",
                        ".test.",
                        ".spec.",
                        "file.ts",
                    ],
                },
            ],
        },
        {
            // This one has a custom provider which should be detected by the rule
            code: `
            @Injectable()
            class ShouldBeProvided {}

            export default ShouldBeProvided;
            `,
            options: [
                {
                    src: [fixturesGlob],
                    filterFromPaths: [
                        "node_modules",
                        ".test.",
                        ".spec.",
                        "file.ts",
                    ],
                },
            ],
        },
        {
            // I've added a reference to this controller in the /fixtures/example.module.ts file so
            // it should not error
            code: `
            import {Controller} from "./Controller.stub";

            @Controller()
            export class ExampleController {}
            `,
            options: [
                {
                    src: [fixturesGlob],
                    filterFromPaths: [
                        "node_modules",
                        ".test.",
                        ".spec.",
                        "file.ts",
                    ],
                },
            ],
        },
        {
            // The code should support decorators that do not use a factory
            // for people using libraries and custom decorators outside of nestjs
            code: `
            import {Injectable} from "./Injectable.stub";
            import {NonFactoryDecorator} from "./NonFactoryDecorator.stub";

            @NonFactoryDecorator
            @Injectable()
            class ExampleProviderIncludedInModule {}

            export default ExampleProviderIncludedInModule;
            `,
            options: [
                {
                    src: [fixturesGlob],
                    filterFromPaths: [
                        "node_modules",
                        ".test.",
                        ".spec.",
                        "file.ts",
                    ],
                },
            ],
        },
        {
            // this provider is included in multiple module's providers located in /fixtures
            code: `
        import {Injectable} from "./Injectable.stub";

        @Injectable()
        class TooManyTimesExampleProviderIncludedInModule {}

        export default TooManyTimesExampleProviderIncludedInModule;
        `,

            options: [
                {
                    src: [fixturesGlob],
                    filterFromPaths: [
                        "node_modules",
                        ".test.",
                        ".spec.",
                        "file.ts",
                    ],
                },
            ],
        },
    ],
    invalid: [
        {
            // this provider is not included in the module's providers located in /fixtures
            code: `
        import {Injectable} from "./Injectable.stub";

        @Injectable()
        class ExampleProviderNOTInModule {}

        export default ExampleProviderNOTInModule;
        `,
            errors: [
                {
                    messageId: "injectableInModule",
                    data: {
                        numberOfReferences: 0,
                        name: "ExampleProviderNOTInModule",
                        refLocations: "",
                    },
                },
            ],
            options: [
                {
                    src: [fixturesGlob],
                    filterFromPaths: [
                        "node_modules",
                        ".test.",
                        ".spec.",
                        "file.ts",
                    ],
                },
            ],
        },
        {
            // A mapping cached for an earlier rule configuration must not be
            // reused when this instance scans a different source path.
            code: `
            import {Injectable} from "./Injectable.stub";

            @Injectable()
            class ExampleProviderIncludedInModule {}
            `,
            errors: [
                {
                    messageId: "injectableInModule",
                },
            ],
            options: [
                {
                    src: [
                        path
                            .join(tsRootDirectory, "does-not-exist", "*.ts")
                            .split(path.sep)
                            .join("/"),
                    ],
                    filterFromPaths: ["node_modules", ".test.", ".spec."],
                },
            ],
        },

        {
            // this provider is not included in the module's providers located in /fixtures
            code: `
            import {Controller} from "./Controller.stub";

            @Controller()
        class BadController {}

        export default BadController;
        `,
            errors: [
                {
                    messageId: "controllersInModule",
                    data: {
                        numberOfReferences: 0,
                        refLocations: "",
                        name: "BadController",
                    },
                },
            ],
            options: [
                {
                    src: [fixturesGlob],
                    filterFromPaths: [
                        "node_modules",
                        ".test.",
                        ".spec.",
                        "file.ts",
                    ],
                },
            ],
        },
    ],
});

describe("injectable-should-be-provided cache updates", () => {
    const tempRoot = fs.mkdtempSync(
        path.join(os.tmpdir(), "nestjs-rule-cache-")
    );

    afterAll(() => {
        fs.rmSync(tempRoot, {recursive: true, force: true});
    });

    it("uses module mappings inserted and replaced during sequential lint runs", () => {
        const sourceDirectory = path.join(tempRoot, "src");
        fs.mkdirSync(sourceDirectory);
        const modulePath = path.join(sourceDirectory, "example.module.ts");
        const targetPath = path.join(sourceDirectory, "example.service.ts");
        const sourceGlob = path
            .join(sourceDirectory, "*.ts")
            .split(path.sep)
            .join("/");
        const options = {
            src: [sourceGlob],
            filterFromPaths: ["node_modules", ".test.", ".spec."],
        };
        const linter = new Linter({cwd: tempRoot});
        const config = {
            files: ["**/*.ts"],
            languageOptions: {
                parser,
                parserOptions: {
                    ecmaVersion: 2015,
                    sourceType: "module" as const,
                },
            },
            plugins: {
                test: {rules: {"injectable-should-be-provided": rule}},
            },
            rules: {"test/injectable-should-be-provided": ["error", options]},
        };
        const targetSource = `
            import {Injectable} from "./Injectable.stub";
            @Injectable()
            export class CachedProvider {}
        `;
        const moduleSource = (providers: string) => `
            import {Module} from "@nestjs/common";
            import {CachedProvider} from "./example.service";
            @Module({providers: [${providers}]})
            export class ExampleModule {}
        `;
        const verify = (code: string, filename: string) =>
            linter.verify(code, config, {filename});

        try {
            const initiallyMissing = verify(targetSource, targetPath);
            expect(initiallyMissing).toHaveLength(1);
            expect(initiallyMissing[0].message).toContain(
                'Injectable "CachedProvider"'
            );

            fs.writeFileSync(modulePath, moduleSource("CachedProvider"));
            expect(
                verify(fs.readFileSync(modulePath, "utf8"), modulePath)
            ).toEqual([]);
            expect(verify(targetSource, targetPath)).toHaveLength(0);

            fs.writeFileSync(modulePath, moduleSource(""));
            expect(
                verify(fs.readFileSync(modulePath, "utf8"), modulePath)
            ).toEqual([]);
            const missingAfterReplacement = verify(targetSource, targetPath);
            expect(missingAfterReplacement).toHaveLength(1);
            expect(missingAfterReplacement[0].message).toContain(
                'Injectable "CachedProvider"'
            );
        } finally {
            fs.rmSync(sourceDirectory, {recursive: true, force: true});
        }
    });
});
