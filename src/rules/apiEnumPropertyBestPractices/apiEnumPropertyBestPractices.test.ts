import {RuleTester} from "@typescript-eslint/rule-tester";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup.js";
import rule from "./apiEnumPropertyBestPractices.js";

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

ruleTester.run("api-enum-property-best-practices", rule, {
    valid: [
        {
            code: `enum MyEnum{
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
        },
        {
            code: `enum MyEnum{
                ValA,
                ValB
            }
            
            class MyClass {
                @ApiProperty()
                public myProperty!:Object
            }`,
        },
        {
            code: `enum MyEnum{
                ValA,
                ValB
            }
            
            class MyClass {
                @ApiPropertyOptional({
                    enumName: "MyEnum",
                    enum: MyEnum,
                })
                public myProperty?:MyEnum
            }`,
        },
        {
            code: `enum MyEnum{
                ValA,
                ValB
            }
            
            class MyClass {
                @ApiPropertyOptional()
                public myProperty?:Object
            }`,
        },
        {
            code: `enum MyEnum{
                ValA,
                ValB
            }
            
            class MyClass {
                @ApiProperty({
                })
                public myProperty: MyEnum | string
            }`,
        },
    ],
    invalid: [
        {
            code: `enum MyEnum{
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
            errors: [
                {
                    messageId: "needsEnumNameAdded",
                },
                {messageId: "needsTypeRemoved"},
            ],
        },
        {
            code: `enum MyEnum{
                ValA,
                ValB
            }
            
            class MyClass {
                @ApiProperty({})
                public myProperty!:MyEnum
            }`,
            errors: [
                {
                    messageId: "needsEnumNameAdded",
                },
            ],
        },
        {
            code: `enum MyEnum{
                ValA,
                ValB
            }
            
            class MyClass {
                @ApiProperty({enumName: "MyEnumTYPO",
                    enum: MyEnum,})
                public myProperty!:MyEnum
            }`,
            errors: [{messageId: "enumNameShouldMatchType"}],
        },
        {
            code: `enum MyEnum{
                ValA,
                ValB
            }
            
            class MyClass {
                @ApiProperty({
                    enum: MyEnum,
                })
                public myProperty!:MyEnum
            }`,
            errors: [
                {
                    messageId: "needsEnumNameAdded",
                },
            ],
        },
        {
            code: `enum MyEnum{
                ValA,
                ValB
            }
            
            class MyClass {
                @ApiProperty({
                    type: MyEnum,
                })
                public myProperty!:MyEnum
            }`,
            errors: [
                {
                    messageId: "needsEnumNameAdded",
                },
                {
                    messageId: "needsTypeRemoved",
                },
            ],
        },
        {
            code: `enum MyEnum{
                ValA,
                ValB
            }
            
            class MyClass {
                @ApiPropertyOptional({
                    type: MyEnum,
                    enum: MyEnum,
                })
                public myProperty?:MyEnum
            }`,
            errors: [
                {
                    messageId: "needsEnumNameAdded",
                },
                {messageId: "needsTypeRemoved"},
            ],
        },
        {
            code: `enum MyEnum{
                ValA,
                ValB
            }
            
            class MyClass {
                @ApiPropertyOptional({})
                public myProperty?:MyEnum
            }`,
            errors: [
                {
                    messageId: "needsEnumNameAdded",
                },
            ],
        },
        {
            code: `enum MyEnum{
                ValA,
                ValB
            }
            
            class MyClass {
                @ApiPropertyOptional({enumName: "MyEnumTYPO",
                    enum: MyEnum,})
                public myProperty?:MyEnum
            }`,
            errors: [{messageId: "enumNameShouldMatchType"}],
        },
        {
            code: `enum MyEnum{
                ValA,
                ValB
            }
            
            class MyClass {
                @ApiPropertyOptional({
                    enum: MyEnum,
                })
                public myProperty?:MyEnum
            }`,
            errors: [
                {
                    messageId: "needsEnumNameAdded",
                },
            ],
        },
        {
            code: `enum MyEnum{
                ValA,
                ValB
            }
            
            class MyClass {
                @ApiPropertyOptional({
                    type: MyEnum,
                })
                public myProperty?:MyEnum
            }`,
            errors: [
                {
                    messageId: "needsEnumNameAdded",
                },
                {
                    messageId: "needsTypeRemoved",
                },
            ],
        },
    ],
});
