import {RuleTester} from "@typescript-eslint/rule-tester";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup";
import rule from "./apiPropertyReturningArrayShouldSetArray";

const tsRootDirectory = getFixturesRootDirectory();
const ruleTester = new RuleTester({
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
            // should ignore using spread or constant
            code: `class TestClass {
                @Expose()
                @ApiPropertyOptional(...someVariable)
                thisIsAStringProp?: Array<string>;}`,
        },
        {
            // should ignore using spread or constant
            code: `class TestClass {
                @Expose()
                @ApiPropertyOptional({ ...swaggerImportDefinitionTypeOptions})
                thisIsAStringProp?: Array<string>;}`,
        },
        {
            // should ignore using spread or constant
            code: `class TestClass {
                @Expose()
                @ApiPropertyOptional(someVariable)
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
