export const testCases = [
    {
        moduleCode: `enum MyEnum{
            ValA,
            ValB
        }
        
        class MyClass {
            @ApiProperty({
                type: BizTaskUiCollectionEnum,
                enum: BizTaskUiCollectionEnum,
            })
            public myProperty!:MyEnum
        }`,
        needsEnumNameProperty: true,
        needsTypeRemoved: true,
        message: "type is present, no enum name",
    },
    {
        moduleCode: `enum MyEnum{
            ValA,
            ValB
        }
        
        class MyClass {
            @ApiProperty({
                enumName: BizTaskUiCollectionEnum,
                enum: BizTaskUiCollectionEnum,
            })
            public myProperty!:MyEnum
        }`,
        needsEnumNameProperty: false,
        needsTypeRemoved: false,
        message: "perfect",
    },
    {
        moduleCode: `enum MyEnum{
            ValA,
            ValB
        }
        
        class MyClass {
            @ApiProperty({
                enum: BizTaskUiCollectionEnum,
            })
            public myProperty!:MyEnum
        }`,
        needsEnumNameProperty: true,
        needsTypeRemoved: false,
        message: "optional everywhere",
    },
    {
        moduleCode: `enum MyEnum{
            ValA,
            ValB
        }
        
        class MyClass {
            @ApiProperty({
                type: BizTaskUiCollectionEnum,
            })
            public myProperty!:MyEnum
        }`,
        needsEnumNameProperty: false,
        needsTypeRemoved: false,
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
        message: "not an enum",
    },
];
