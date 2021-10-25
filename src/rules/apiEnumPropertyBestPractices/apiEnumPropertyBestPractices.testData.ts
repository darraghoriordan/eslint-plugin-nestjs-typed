/* eslint-disable unicorn/filename-case */
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
        needsEnumProperty: false,
        needsEnumNameProperty: true,
        needsTypeRemoved: true,
        needsEnumNameToMatchEnumType: false,
        isEnumType: true,
        message: "type is present, no enum name prop",
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
        needsEnumProperty: false,
        needsEnumNameProperty: false,
        needsTypeRemoved: false,
        needsEnumNameToMatchEnumType: false,
        isEnumType: true,
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
        needsEnumProperty: false,
        needsEnumNameProperty: true,
        needsTypeRemoved: false,
        needsEnumNameToMatchEnumType: false,
        isEnumType: true,
        message: "missing enum name, no type present",
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
        needsEnumProperty: true,
        needsEnumNameProperty: true,
        needsTypeRemoved: true,
        needsEnumNameToMatchEnumType: false,
        isEnumType: true,
        message: "has type, missing everything else",
    },
    {
        moduleCode: `enum MyEnum{
            ValA,
            ValB
        }
        
        class MyClass {
            @ApiProperty()
            public myProperty!:Object
        }`,
        needsEnumProperty: false,
        needsEnumNameProperty: false,
        needsTypeRemoved: false,
        needsEnumNameToMatchEnumType: false,
        isEnumType: false,
        message: "not an enum at all",
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
        needsEnumProperty: true,
        needsEnumNameProperty: true,
        needsTypeRemoved: false,
        needsEnumNameToMatchEnumType: false,
        isEnumType: true,
        message: "missing all but still has property",
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
        needsEnumProperty: false,
        needsEnumNameProperty: false,
        needsTypeRemoved: false,
        needsEnumNameToMatchEnumType: true,
        isEnumType: true,
        message: "enum name doesn't match enum type",
    },
];
