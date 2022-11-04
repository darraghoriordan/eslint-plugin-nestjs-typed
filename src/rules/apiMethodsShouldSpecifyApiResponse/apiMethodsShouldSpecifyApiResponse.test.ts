import {ESLintUtils} from "@typescript-eslint/utils";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup";
import rule from "./apiMethodsShouldSpecifyApiResponse";

const tsRootDirectory = getFixturesRootDirectory();
const ruleTester = new ESLintUtils.RuleTester({
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2015,
        tsconfigRootDir: tsRootDirectory,
        project: "./tsconfig.json",
    },
});

ruleTester.run("api-method-should-specify-api-response", rule, {
    valid: [
        {
            code: `class TestClass {
                @Get()
                @ApiOkResponse({ type: String, isArray: true })
                @ApiBadRequestResponse({ description: "Bad Request" })
                public getAll(): Promise<string[]> {
                    return [];
                }
            }`,
        },
        {
            code: `class TestClass {
                @Get()
                @ApiResponse({ status: 200, type: String })
                public getAll(): Promise<string[]> {
                    return [];
                }
            }`,
        },
        {
            // not an api decorated class
            code: `class TestClass {
                public getAll(): Promise<string[]> {
                    return [];
                }
            }`,
        },
    ],
    invalid: [
        {
            code: `class TestClass {
                @Get()
                public getAll(): Promise<string[]> {
                    return [];
                }
            }`,
            errors: [
                {
                    messageId: "shouldSpecifyApiResponse",
                },
            ],
        },
        {
            code: `class TestClass {
                @All()
                public getAll(): Promise<string[]> {
                    return [];
                }
            }`,
            errors: [
                {
                    messageId: "shouldSpecifyApiResponse",
                },
            ],
        },
    ],
});
