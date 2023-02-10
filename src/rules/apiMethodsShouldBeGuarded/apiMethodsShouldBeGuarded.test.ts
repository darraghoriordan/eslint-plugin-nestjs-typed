import {ESLintUtils} from "@typescript-eslint/utils";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup";
import rule from "./apiMethodsShouldBeGuarded";

const tsRootDirectory = getFixturesRootDirectory();
const ruleTester = new ESLintUtils.RuleTester({
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2015,
        tsconfigRootDir: tsRootDirectory,
        project: "./tsconfig.json",
    },
});

ruleTester.run("api-methods-should-be-guarded", rule, {
    valid: [
        {
            code: `class TestClass {
                @Get()
                @UseGuards(AuthGuard('jwt'))
                public getAll(): Promise<string[]> {
                    return [];
                }
            }`,
        },
        {
            code: `
                @UseGuards(AuthGuard('jwt'))
                class TestClass {
                @Get()
                public getAll(): Promise<string[]> {
                    return [];
                }
            }`,
        },
        {
            code: `class TestClass {
                @Post()
                @UseGuards(MyCustomGuard('hand-gestures'))
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
                    messageId: "apiMethodsShouldBeGuarded",
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
                    messageId: "apiMethodsShouldBeGuarded",
                },
            ],
        },
        {
            code: `class TestClass {
                @Post('can-register')
                @ApiOperation({ summary: 'Check if registration is available by Company name' })
                async canRegister(
                    @Body() { companyName }: CompanyCanRegisterDto,
                    @Query('countryCode') countryCode?: string,
                ): Promise<TResultResponse<boolean>> {
                    const result = await this.companiesService.canRegisterName(companyName, countryCode)

                    return { result }
                }
            }`,
            errors: [{messageId: "apiMethodsShouldBeGuarded"}],
        },
    ],
});
