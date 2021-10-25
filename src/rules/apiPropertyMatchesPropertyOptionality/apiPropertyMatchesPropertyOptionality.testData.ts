export const testCases = [
    {
        moduleCode: `class TestClass {
        @Expose()
        @ApiPropertyOptional()
        thisIsAStringProp?: string;}`,
        shouldUseOptionalDecorator: false,
        shouldUseRequiredDecorator: false,
        message: "optional everywhere",
    },
    {
        moduleCode: `class TestClass {@Expose()
        @ApiPropertyOptional()
        thisIsAStringProp: string;}`,
        shouldUseOptionalDecorator: false,
        shouldUseRequiredDecorator: true,
        message: "optional decorator, required prop",
    },
    {
        moduleCode: `class TestClass {@Expose()
        @ApiPropertyOptional()
        thisIsAStringProp!: string;}`,
        shouldUseOptionalDecorator: false,
        shouldUseRequiredDecorator: true,
        message: "optional decorator, required prop",
    },
    {
        moduleCode: `class TestClass {@Expose()
        @ApiProperty()
        thisIsAStringProp?: string;}`,
        shouldUseOptionalDecorator: true,
        shouldUseRequiredDecorator: false,
        message: "required decorator, optional prop",
    },
    {
        moduleCode: `class TestClass {@Expose()
        @ApiProperty()
        thisIsAStringProp: string | undefined;}`,
        shouldUseOptionalDecorator: true,
        shouldUseRequiredDecorator: false,
        message: "required decorator, optional prop",
    },
    {
        moduleCode: `class TestClass {@Expose()
        @ApiPropertyOptional()
        thisIsAStringProp: string | undefined;}`,
        shouldUseOptionalDecorator: false,
        shouldUseRequiredDecorator: false,
        message: "optional decorator, optional prop",
    },
];
