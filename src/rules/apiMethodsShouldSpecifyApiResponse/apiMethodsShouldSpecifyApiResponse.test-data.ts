export const testCases = [
    {
        moduleCode: `class TestClass {
            @Get()
            @ApiOkResponse({ type: String, isArray: true })
            @ApiBadRequestResponse({ description: "Bad Request" })
            public getAll(): Promise<string[]> {
                return [];
            }
        }`,
        shouldUseDecorator: false,
        message: "all good",
    },
    {
        moduleCode: `class TestClass {
            @Get()
            @ApiResponse({ status: 200, type: String })
            public getAll(): Promise<string[]> {
                return [];
            }
        }`,
        shouldUseDecorator: false,
        message: "all good",
    },
    {
        moduleCode: `class TestClass {
            @Get()
            public getAll(): Promise<string[]> {
                return [];
            }
        }`,
        shouldUseDecorator: true,
        message: "no api operation decorator",
    },
    {
        moduleCode: `class TestClass {
            public getAll(): Promise<string[]> {
                return [];
            }
        }`,
        shouldUseDecorator: false,
        message: "not an http method",
    },
];
