import {RuleTester} from "@typescript-eslint/rule-tester";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup.js";
import rule from "./useCorrectEndpointNamingConvention.js";

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

ruleTester.run("use-correct-endpoint-naming-convention", rule, {
    valid: [
        // Valid: Controller with plural resource name
        {
            code: `
                @Controller('tests')
                class TestClass {
                    @Get()
                    public getAll() {}
                }`,
        },
        // Valid: Controller with plural and kebab-case
        {
            code: `
                @Controller('test-cases')
                class TestClass {
                    @Get()
                    public getAll() {}
                }`,
        },
        // Valid: Route with kebab-case and parameter
        {
            code: `
                @Controller('tests')
                class TestClass {
                    @Get('some-param/:someParam')
                    public getByParam(@Param('someParam') param) {}
                }`,
        },
        // Valid: Multiple route segments in kebab-case
        {
            code: `
                @Controller('users')
                class TestClass {
                    @Get('active-users/by-date')
                    public getActiveUsers() {}
                }`,
        },
        // Valid: Route with no path (inherits from controller)
        {
            code: `
                @Controller('users')
                class TestClass {
                    @Get()
                    public getAll() {}
                }`,
        },
        // Valid: Not a controller (should be ignored)
        {
            code: `
                class TestClass {
                    @Get()
                    public getAll() {}
                }`,
        },
        // Valid: Empty controller path
        {
            code: `
                @Controller()
                class TestClass {
                    @Get('users')
                    public getAll() {}
                }`,
        },
        // Valid: Controller with empty string path
        {
            code: `
                @Controller('')
                class TestClass {
                    @Get('users')
                    public getAll() {}
                }`,
        },
        // Valid: Route with wildcard (should be ignored for case checking)
        {
            code: `
                @Controller('users')
                class TestClass {
                    @Get('*')
                    public catchAll() {}
                }`,
        },
        // Valid: Pluralization check disabled
        {
            code: `
                @Controller('test')
                class TestClass {
                    @Get()
                    public getAll() {}
                }`,
            options: [{checkPluralization: false, caseFormat: "kebab-case"}],
        },
        // Valid: snake_case format
        {
            code: `
                @Controller('test_cases')
                class TestClass {
                    @Get('active_users')
                    public getActiveUsers() {}
                }`,
            options: [{checkPluralization: true, caseFormat: "snake_case"}],
        },
        // Valid: camelCase format
        {
            code: `
                @Controller('testCases')
                class TestClass {
                    @Get('activeUsers')
                    public getActiveUsers() {}
                }`,
            options: [{checkPluralization: true, caseFormat: "camelCase"}],
        },
        // Valid: Different HTTP methods
        {
            code: `
                @Controller('users')
                class TestClass {
                    @Post('new-user')
                    public create() {}
                    
                    @Put('update-user/:id')
                    public update() {}
                    
                    @Delete('remove-user/:id')
                    public remove() {}
                    
                    @Patch('modify-user/:id')
                    public modify() {}
                }`,
        },
    ],
    invalid: [
        // Invalid: Singular controller name
        {
            code: `
                @Controller('test')
                class TestClass {
                    @Get()
                    public getAll() {}
                }`,
            errors: [
                {
                    messageId: "controllerPathShouldBePlural",
                },
            ],
        },
        // Invalid: camelCase in controller (should be kebab-case)
        {
            code: `
                @Controller('testCases')
                class TestClass {
                    @Get()
                    public getAll() {}
                }`,
            errors: [
                {
                    messageId: "controllerPathShouldBeKebabCase",
                },
            ],
        },
        // Invalid: camelCase in route
        {
            code: `
                @Controller('tests')
                class TestClass {
                    @Get('getByParam/:someParam')
                    public getByParam(@Param('someParam') param) {}
                }`,
            errors: [
                {
                    messageId: "routePathShouldBeKebabCase",
                },
            ],
        },
        // Invalid: Multiple issues - singular and wrong case
        {
            code: `
                @Controller('testCase')
                class TestClass {
                    @Get()
                    public getAll() {}
                }`,
            errors: [
                {
                    messageId: "controllerPathShouldBePlural",
                },
                {
                    messageId: "controllerPathShouldBeKebabCase",
                },
            ],
        },
        // Invalid: Route with mixed case
        {
            code: `
                @Controller('users')
                class TestClass {
                    @Get('activeUsers/byDate')
                    public getActiveUsers() {}
                }`,
            errors: [
                {
                    messageId: "routePathShouldBeKebabCase",
                },
            ],
        },
        // Invalid: Post with camelCase
        {
            code: `
                @Controller('users')
                class TestClass {
                    @Post('createUser')
                    public create() {}
                }`,
            errors: [
                {
                    messageId: "routePathShouldBeKebabCase",
                },
            ],
        },
        // Invalid: PascalCase in controller
        {
            code: `
                @Controller('TestCases')
                class TestClass {
                    @Get()
                    public getAll() {}
                }`,
            errors: [
                {
                    messageId: "controllerPathShouldBeKebabCase",
                },
            ],
        },
        // Invalid: snake_case when expecting kebab-case
        {
            code: `
                @Controller('test_cases')
                class TestClass {
                    @Get()
                    public getAll() {}
                }`,
            errors: [
                {
                    messageId: "controllerPathShouldBeKebabCase",
                },
            ],
        },
        // Invalid: kebab-case when expecting snake_case
        {
            code: `
                @Controller('test-cases')
                class TestClass {
                    @Get('active-users')
                    public getActiveUsers() {}
                }`,
            options: [{checkPluralization: true, caseFormat: "snake_case"}],
            errors: [
                {
                    messageId: "controllerPathShouldBeKebabCase",
                },
                {
                    messageId: "routePathShouldBeKebabCase",
                },
            ],
        },
        // Invalid: Multiple routes with issues
        {
            code: `
                @Controller('users')
                class TestClass {
                    @Get('activeUsers')
                    public getActive() {}
                    
                    @Post('createNew')
                    public create() {}
                }`,
            errors: [
                {
                    messageId: "routePathShouldBeKebabCase",
                },
                {
                    messageId: "routePathShouldBeKebabCase",
                },
            ],
        },
    ],
});
