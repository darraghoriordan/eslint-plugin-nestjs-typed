import {ESLintUtils} from "@typescript-eslint/utils";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup";
import rule from "./apiPropertyReturningArrayShouldSetArray";

const tsRootDirectory = getFixturesRootDirectory();
const ruleTester = new ESLintUtils.RuleTester({
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2015,
        tsconfigRootDir: tsRootDirectory,
        project: "./tsconfig.json",
    },
});

ruleTester.run("api-property-returning-array-should-set-array", rule, {
    valid: [
        {
            code: `export class TestClass {
            @Expose()
            @ApiPropertyOptional({isArray:true})
            thisIsAStringProp?: string[];}`,
        },
        {
            code: `class TestClass {
                @Expose()
                @ApiPropertyOptional({isArray:true})
                thisIsAStringProp?: Array<string>;}`,
        },
        {
            code: `class TestClass {
                @Expose()
                @ApiPropertyOptional()
                thisIsABooleanProp = false}`,
        },
    ],
    invalid: [
        {
            code: `export class TestClass {
                @Expose()
                @ApiPropertyOptional({isArray:true})
                thisIsAStringProp?: string;}`,
            errors: [
                {
                    messageId: "shouldSetArrayPropertyFalse",
                },
            ],
        },
        {
            code: `class TestClass {
                @Expose()
                @ApiPropertyOptional()
                thisIsAStringProp?: Array<string>;}`,
            errors: [
                {
                    messageId: "shouldSetArrayPropertyTrue",
                },
            ],
        },
        {
            code: `class TestClass {
                @Expose()
                @ApiPropertyOptional({isArray:false})
                thisIsAStringProp?: Array<string>;}`,
            errors: [
                {
                    messageId: "shouldSetArrayPropertyTrue",
                },
            ],
        },
    ],
});
