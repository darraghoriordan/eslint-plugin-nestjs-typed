import {ESLintUtils} from "@typescript-eslint/utils";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup";
import rule from "./controllerDecoratedHasApiTags";

const tsRootDirectory = getFixturesRootDirectory();
const ruleTester = new ESLintUtils.RuleTester({
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2015,
        tsconfigRootDir: tsRootDirectory,
        project: "./tsconfig.json",
    },
});

ruleTester.run("controllers-should-supply-api-tags", rule, {
    valid: [
        {
            code: `
            @ApiTags("my-tag")
            @Controller("my-controller")
            class TestClass {
          }`,
        },
        {
            code: `
            class TestClass {
          }`,
        },
    ],
    invalid: [
        {
            code: `
            @Controller("my-controller")
            class TestClass {
          }`,
            errors: [
                {
                    messageId: "shouldUseApiTagDecorator",
                },
            ],
        },
    ],
});
