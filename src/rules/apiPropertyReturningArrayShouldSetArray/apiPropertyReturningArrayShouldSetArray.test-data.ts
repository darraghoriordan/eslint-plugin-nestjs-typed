export const testCases = [
    {
        moduleCode: `class TestClass {
        @Expose()
        @ApiPropertyOptional({isArray:true})
        thisIsAStringProp?: string[];}`,
        shouldSetIsArrayFalse: false,
        shouldSetIsArrayTrue: false,
        message: "set ok",
    },
    {
        moduleCode: `class TestClass {
        @Expose()
        @ApiPropertyOptional({isArray:true})
        thisIsAStringProp?: Array<string>;}`,
        shouldSetIsArrayFalse: false,
        shouldSetIsArrayTrue: false,
        message: "set ok",
    },
    {
        moduleCode: `class TestClass {
        @Expose()
        @ApiPropertyOptional({isArray:false})
        thisIsAStringProp?: Array<string>;}`,
        shouldSetIsArrayFalse: false,
        shouldSetIsArrayTrue: true,
        message: "mismatch is array prop",
    },
    {
        moduleCode: `class TestClass {
        @Expose()
        @ApiPropertyOptional()
        thisIsAStringProp?: Array<string>;}`,
        shouldSetIsArrayFalse: false,
        shouldSetIsArrayTrue: true,
        message: "should set tue",
    },
    {
        moduleCode: `class TestClass {
        @Expose()
        @ApiPropertyOptional({isArray:true})
        thisIsAStringProp?: string;}`,
        shouldSetIsArrayFalse: true,
        shouldSetIsArrayTrue: false,
        message: "mismatch not array prop",
    },
];
