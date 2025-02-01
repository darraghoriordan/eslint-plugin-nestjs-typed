import {RuleTester} from "@typescript-eslint/rule-tester";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup.js";
import rule from "./controllerDecoratedHasApiTags.js";

const tsRootDirectory = getFixturesRootDirectory();
const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            projectService: {
                defaultProject: "tsconfig.json",
            },
            tsconfigRootDir: tsRootDirectory,
            allowDefaultProject: false,
        },
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
