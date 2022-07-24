/* eslint-disable unicorn/prefer-module */
/* eslint-disable unicorn/prevent-abbreviations */

import rule from "./injectableShouldBeProvided";
import {ESLintUtils} from "@typescript-eslint/utils";

import {getFixturesRootDirectory} from "../../testing/fixtureSetup";
import path from "path";

const tsRootDirectory = getFixturesRootDirectory();
console.debug("Using tsrootdirectory", {tsRootDirectory});

const ruleTester = new ESLintUtils.RuleTester({
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2015,
        tsconfigRootDir: tsRootDirectory,
        project: "tsconfig-withMeta.json",
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
                    src: [path.join(__dirname + "../../../fixtures", "*.ts")],
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
                    src: [path.join(__dirname + "../../../fixtures", "*.ts")],
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
                    src: [path.join(__dirname + "../../../fixtures", "*.ts")],
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
                    src: [path.join(__dirname + "../../../fixtures", "*.ts")],
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
            errors: [{messageId: "injectableInModule"}],
            options: [
                {
                    src: [path.join(__dirname + "../../../fixtures", "*.ts")],
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
            // this provider is not included in the module's providers located in /fixtures
            code: `
            import {Controller} from "./Controller.stub";

            @Controller()
        class BadController {}
        
        export default BadController;
        `,
            errors: [{messageId: "controllersInModule"}],
            options: [
                {
                    src: [path.join(__dirname + "../../../fixtures", "*.ts")],
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
