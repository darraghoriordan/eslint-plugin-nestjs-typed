/* eslint-disable unicorn/filename-case */

export const pathPartTestCases = [
    {
        moduleCode: `
            @Get(":uuid")
            class MyClass {}
        `,
        paths: ['":uuid"'],
        message: "gets one on method decorator",
    },
    {
        moduleCode: `
        @Controller("custom-bot/:uuid/my-controller")
        class MyClass {}
        `,
        paths: ['"custom-bot/:uuid/my-controller"'],
        message: "gets one on controller decorator",
    },
    {
        moduleCode: `
        @Controller(["custom-bot/:uuid/my-controller","custom-bot/:uuid/my-controller"])
        class MyClass {}
        `,
        paths: [
            '"custom-bot/:uuid/my-controller"',
            '"custom-bot/:uuid/my-controller"',
        ],
        message: "gets array on controller decorator",
    },
    {
        moduleCode: `
            @Get([":uuid",":uuid"])
            class MyClass {}
        `,
        paths: ['":uuid"', '":uuid"'],
        message: "gets array of method decorator",
    },
    {
        moduleCode: `
            @Get([])
            class MyClass {}
        `,
        paths: [],
        message: "handles empty array",
    },
    {
        moduleCode: `
        @Controller({path: "custom-bot/:uuid/my-controller", someOtherProp: "sdfsdf" })
        class MyClass {}
        `,
        paths: ['"custom-bot/:uuid/my-controller"'],
        message: "handles controller options",
    },
];

export const responseParsingTestCases = [
    {
        pathToCheck: `uuid`,
        paths: ['":uuid"'],
        shouldResult: true,
    },
    {
        pathToCheck: `uui`,
        paths: ['":uuid"'],
        shouldResult: false,
    },
    {
        pathToCheck: `uuid`,
        paths: ['"/lots/of/text/:uuid"'],
        shouldResult: true,
    },
    {
        pathToCheck: `uui`,
        paths: ['"/lots/of/text/:uuid/"'],
        shouldResult: false,
    },
    {
        pathToCheck: `uuid`,
        paths: ['"/lots/of/text/:uuid/"'],
        shouldResult: true,
    },
    {
        pathToCheck: `uuid`,
        paths: ['"/lots/of/:uuid/text"'],
        shouldResult: true,
    },
    {
        pathToCheck: `uuid`,
        paths: ['":uuid/lots/of/text"'],
        shouldResult: true,
    },
    {
        pathToCheck: `uuid`,
        paths: ['"/:uuid/lots/of/text"'],
        shouldResult: true,
    },
    {
        pathToCheck: `uui`,
        paths: ['"/lots/of/text/:uuid"'],
        shouldResult: false,
    },
    {
        pathToCheck: `uuid`,
        paths: ['":uuid"', '"notMatch"'],
        shouldResult: true,
    },
    {
        pathToCheck: `uuid`,
        paths: ['"notMatch"'],
        shouldResult: false,
    },
    {
        pathToCheck: `uuid`,
        paths: [],
        shouldResult: false,
    },
    {
        pathToCheck: `uuid`,
        paths: ['""', ""],
        shouldResult: false,
    },
];
