import {ESLintUtils} from "@typescript-eslint/utils";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup";
import rule from "./apiMethodsShouldSpecifyApiOperation";

const tsRootDirectory = getFixturesRootDirectory();
const ruleTester = new ESLintUtils.RuleTester({
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2015,
        tsconfigRootDir: tsRootDirectory,
        project: "./tsconfig.json",
    },
});

ruleTester.run("api-method-should-specify-api-operation", rule, {
    valid: [
        {
            code: `class TestClassA {
                @Get()
                @ApiOperation({ description: "test description" })
                @ApiOkResponse({ type: String, isArray: true })
                public getAll(): Promise<string[]> {
                    return [];
                }
            }`,
        },
        {
            code: `class TestClassB {
                @Get()
                @ApiOperation({ description: "test description" })
                public getAll(): Promise<string[]> {
                    return [];
                }
            }`,
        },
        {
            // not an api decorated class
            code: `class TestClassC {
                public getAll(): Promise<string[]> {
                    return [];
                }
            }`,
        },
    ],
    invalid: [
        {
            code: `class TestClassD {
                @Get()
                public getAll(): Promise<string[]> {
                    return [];
                }
            }`,
            errors: [
                {
                    messageId: "shouldSpecifyApiOperation",
                },
            ],
        },
        {
            code: `class TestClassE {
                @All()
                public getAll(): Promise<string[]> {
                    return [];
                }
            }`,
            errors: [
                {
                    messageId: "shouldSpecifyApiOperation",
                },
            ],
        },
    ],
});
