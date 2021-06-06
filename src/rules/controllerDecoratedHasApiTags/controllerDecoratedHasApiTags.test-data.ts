export const testCases = [
    {
        moduleCode: `
        @ApiTags("my-tag")
        @Controller("my-controller")
        class TestClass {
      }`,
        shouldUseApiTagsDecorator: false,
        message: "all good state",
    },
    {
        moduleCode: `
        @Controller("my-controller")
        class TestClass {
      }`,
        shouldUseApiTagsDecorator: true,
        message: "missing tag",
    },
    {
        moduleCode: `
        class TestClass {
      }`,
        shouldUseApiTagsDecorator: false,
        message: "not a controller",
    },
];
