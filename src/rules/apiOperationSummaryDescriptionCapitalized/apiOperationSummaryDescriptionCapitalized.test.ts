import {RuleTester} from "@typescript-eslint/rule-tester";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup.js";
import rule from "./apiOperationSummaryDescriptionCapitalized.js";

const tsRootDirectory = getFixturesRootDirectory();
const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            ecmaVersion: 2015,
            tsconfigRootDir: tsRootDirectory,
            project: "./tsconfig.json",
        },
    },
});

ruleTester.run("api-operation-summary-description-capitalized", rule, {
    valid: [
        {
            code: `class TestClass {
                @Post("logout")
                @ApiOperation({
                    summary: "Clears the access-token cookie"
                })
                postLogout(@Res() res: Response) {
                    return;
                }
            }`,
        },
        {
            code: `class TestClass {
                @Get()
                @ApiOperation({
                    description: "Returns all items"
                })
                public getAll(): Promise<string[]> {
                    return [];
                }
            }`,
        },
        {
            code: `class TestClass {
                @Get()
                @ApiOperation({
                    summary: "Get all items",
                    description: "This method returns all available items from the database"
                })
                public getAll(): Promise<string[]> {
                    return [];
                }
            }`,
        },
        {
            code: `class TestClass {
                @Get()
                @ApiOperation({
                    summary: "123 items"
                })
                public getAll(): Promise<string[]> {
                    return [];
                }
            }`,
        },
        {
            code: `class TestClass {
                @Get()
                @ApiOperation({
                    summary: "ÄÖÜ uppercase special chars"
                })
                public getAll(): Promise<string[]> {
                    return [];
                }
            }`,
        },
        {
            // not an api decorated method
            code: `class TestClass {
                public getAll(): Promise<string[]> {
                    return [];
                }
            }`,
        },
        {
            // ApiOperation with no arguments
            code: `class TestClass {
                @Get()
                @ApiOperation()
                public getAll(): Promise<string[]> {
                    return [];
                }
            }`,
        },
        {
            // Empty summary/description should not fail
            code: `class TestClass {
                @Get()
                @ApiOperation({
                    summary: ""
                })
                public getAll(): Promise<string[]> {
                    return [];
                }
            }`,
        },
    ],
    invalid: [
        {
            code: `class TestClass {
                @Post("logout")
                @ApiOperation({
                    summary: "clears the access-token cookie"
                })
                postLogout(@Res() res: Response) {
                    return;
                }
            }`,
            errors: [
                {
                    messageId: "shouldBeCapitalized",
                    data: {
                        property: "summary",
                        value: "clears the access-token cookie",
                    },
                },
            ],
        },
        {
            code: `class TestClass {
                @Get()
                @ApiOperation({
                    description: "returns all items"
                })
                public getAll(): Promise<string[]> {
                    return [];
                }
            }`,
            errors: [
                {
                    messageId: "shouldBeCapitalized",
                    data: {
                        property: "description",
                        value: "returns all items",
                    },
                },
            ],
        },
        {
            code: `class TestClass {
                @Get()
                @ApiOperation({
                    summary: "get all items",
                    description: "this method returns all available items"
                })
                public getAll(): Promise<string[]> {
                    return [];
                }
            }`,
            errors: [
                {
                    messageId: "shouldBeCapitalized",
                    data: {
                        property: "summary",
                        value: "get all items",
                    },
                },
                {
                    messageId: "shouldBeCapitalized",
                    data: {
                        property: "description",
                        value: "this method returns all available items",
                    },
                },
            ],
        },
        {
            code: `class TestClass {
                @Put(":id")
                @ApiOperation({
                    summary: "updates an existing item"
                })
                public update(): Promise<void> {
                    return;
                }
            }`,
            errors: [
                {
                    messageId: "shouldBeCapitalized",
                    data: {
                        property: "summary",
                        value: "updates an existing item",
                    },
                },
            ],
        },
    ],
});
