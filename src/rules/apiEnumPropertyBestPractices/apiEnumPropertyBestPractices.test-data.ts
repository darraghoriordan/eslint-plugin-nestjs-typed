export const testCases = [
    {
        moduleCode: `enum MyEnum{
            ValA,
            ValB
        }
        
        class MyClass {
            @ApiProperty({
                type: MyEnum,
                enum: MyEnum,
            })
            public myProperty!:MyEnum
        }`,
        needsEnumNameProperty: true,
        needsTypeRemoved: true,
        needsEnumNameToMatchEnumType: false,
        message: "type is present, no enum name",
    },
    {
        moduleCode: `enum MyEnum{
            ValA,
            ValB
        }
        
        class MyClass {
            @ApiProperty({
                enumName: "MyEnum",
                enum: MyEnum,
            })
            public myProperty!:MyEnum
        }`,
        needsEnumNameProperty: false,
        needsTypeRemoved: false,
        needsEnumNameToMatchEnumType: false,
        message: "perfect",
    },
    {
        moduleCode: `enum MyEnum{
            ValA,
            ValB
        }
        
        class MyClass {
            @ApiProperty({
                enum: MyEnum,
            })
            public myProperty!:MyEnum
        }`,
        needsEnumNameProperty: true,
        needsTypeRemoved: false,
        needsEnumNameToMatchEnumType: false,
        message: "optional everywhere",
    },
    {
        moduleCode: `enum MyEnum{
            ValA,
            ValB
        }
        
        class MyClass {
            @ApiProperty({
                type: MyEnum,
            })
            public myProperty!:MyEnum
        }`,
        needsEnumNameProperty: false,
        needsTypeRemoved: false,
        needsEnumNameToMatchEnumType: false,
        message: "not an enum",
    },
    {
        moduleCode: `enum MyEnum{
            ValA,
            ValB
        }
        
        class MyClass {
            @ApiProperty()
            public myProperty!:MyEnum
        }`,
        needsEnumNameProperty: false,
        needsTypeRemoved: false,
        needsEnumNameToMatchEnumType: false,
        message: "not an enum",
    },
    {
        moduleCode: `enum MyEnum{
            ValA,
            ValB
        }
        
        class MyClass {
            @ApiProperty({})
            public myProperty!:MyEnum
        }`,
        needsEnumNameProperty: false,
        needsTypeRemoved: false,
        needsEnumNameToMatchEnumType: false,
        message: "not an enum",
    },
    {
        moduleCode: `enum MyEnum{
            ValA,
            ValB
        }
        
        class MyClass {
            @ApiProperty({enumName: "MyEnumTYPO",
                enum: MyEnum,})
            public myProperty!:MyEnum
        }`,
        needsEnumNameProperty: false,
        needsTypeRemoved: false,
        needsEnumNameToMatchEnumType: true,
        message: "enum name doesn't match enum type",
    },
];
