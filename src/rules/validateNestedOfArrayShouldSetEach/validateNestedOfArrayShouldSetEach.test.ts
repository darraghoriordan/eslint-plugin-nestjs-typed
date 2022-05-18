import {ESLintUtils} from "@typescript-eslint/utils";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup";
import rule from "./validateNestedOfArrayShouldSetEach";

const tsRootDirectory = getFixturesRootDirectory();
const ruleTester = new ESLintUtils.RuleTester({
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2015,
        tsconfigRootDir: tsRootDirectory,
        project: "./tsconfig.json",
    },
});

ruleTester.run("validate-nested-of-array-should-set-each", rule, {
    valid: [
        {
            code: `export class CreateOrganisationDto {
                @ApiProperty({ type: Person, isArray: true })
                @ValidateNested({each:true})
                members!: MyClass[]
            }`,
        },
        {
            code: `class TestClass {
                @Expose()
                @ValidateNested({each:true})
                thisIsAStringProp?: Array<MyClass>;}`,
        },
    ],
    invalid: [
        {
            code: `export class TestClass {
                @Expose()
                @ValidateNested({each:true})
                thisIsAStringProp?: string;}`,
            errors: [
                {
                    messageId: "shouldSetEachPropertyFalse",
                },
            ],
        },
        {
            code: `class TestClass {
                @Expose()
                @ValidateNested()
                thisIsAStringProp?: Array<string>;}`,
            errors: [
                {
                    messageId: "shouldSetEachPropertyTrue",
                },
            ],
        },
        {
            code: `class TestClass {
                @Expose()
                @ValidateNested({})
                thisIsAStringProp?: Array<string>;}`,
            errors: [
                {
                    messageId: "shouldSetEachPropertyTrue",
                },
            ],
        },
    ],
});
