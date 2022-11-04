import {ESLintUtils} from "@typescript-eslint/utils";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup";
import rule from "./apiEnumPropertyBestPractices";

const tsRootDirectory = getFixturesRootDirectory();
const ruleTester = new ESLintUtils.RuleTester({
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2015,
        tsconfigRootDir: tsRootDirectory,
        project: "./tsconfig.json",
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
    ],
});
