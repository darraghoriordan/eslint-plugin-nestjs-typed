import {ESLintUtils} from "@typescript-eslint/utils";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup";
import rule from "./apiPropertyMatchesPropertyOptionality";

const tsRootDirectory = getFixturesRootDirectory();
const ruleTester = new ESLintUtils.RuleTester({
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2015,
        tsconfigRootDir: tsRootDirectory,
        project: "./tsconfig.json",
    },
});

ruleTester.run("api-property-matches-property-optionality", rule, {
    valid: [
        {
            code: `class TestClass {
                @Expose()
                @ApiPropertyOptional()
                thisIsAStringProp?: string;}`,
        },
        {
            code: `class TestClass {@Expose()
                @ApiPropertyOptional()
                thisIsAStringProp: string | undefined;}`,
        },
    ],
    invalid: [
        {
            code: `class TestClass {@Expose()
                @ApiPropertyOptional()
                thisIsAStringProp: string;}`,
            errors: [
                {
                    messageId: "shouldUseRequiredDecorator",
                },
            ],
        },
        {
            code: `class TestClass {@Expose()
                @ApiPropertyOptional()
                thisIsAStringProp!: string;}`,
            errors: [
                {
                    messageId: "shouldUseRequiredDecorator",
                },
            ],
        },
        {
            code: `class TestClass {@Expose()
                @ApiProperty()
                thisIsAStringProp?: string;}`,
            errors: [
                {
                    messageId: "shouldUseOptionalDecorator",
                },
            ],
        },
        {
            code: `class TestClass {@Expose()
                @ApiProperty()
                thisIsAStringProp: string | undefined;}`,
            errors: [
                {
                    messageId: "shouldUseOptionalDecorator",
                },
            ],
        },
    ],
});
