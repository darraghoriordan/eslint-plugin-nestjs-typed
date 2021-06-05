export const testCases = [
    {
        moduleCode: `class TestClass {
        @Expose()
        @ApiPropertyOptional()
        thisIsAStringProp?: string;}`,
        hasOptionalMismatch: false,
        hasRequiredMismatch: false,
        message: "optional everywhere",
    },
    {
        moduleCode: `class TestClass {@Expose()
        @ApiPropertyOptional()
        thisIsAStringProp: string;}`,
        hasOptionalMismatch: true,
        hasRequiredMismatch: false,
        message: "optional decorator, required prop",
    },
    {
        moduleCode: `class TestClass {@Expose()
        @ApiPropertyOptional()
        thisIsAStringProp!: string;}`,
        hasOptionalMismatch: true,
        hasRequiredMismatch: false,
        message: "optional decorator, required prop",
    },
    {
        moduleCode: `class TestClass {@Expose()
        @ApiProperty()
        thisIsAStringProp?: string;}`,
        hasOptionalMismatch: false,
        hasRequiredMismatch: true,
        message: "required decorator, optional prop",
    },
    {
        moduleCode: `class TestClass {@Expose()
        @ApiProperty()
        thisIsAStringProp: string | undefined;}`,
        hasOptionalMismatch: false,
        hasRequiredMismatch: true,
        message: "required decorator, optional prop",
    },
    {
        moduleCode: `class TestClass {@Expose()
        @ApiPropertyOptional()
        thisIsAStringProp: string | undefined;}`,
        hasOptionalMismatch: false,
        hasRequiredMismatch: false,
        message: "optional decorator, optional prop",
    },
];
