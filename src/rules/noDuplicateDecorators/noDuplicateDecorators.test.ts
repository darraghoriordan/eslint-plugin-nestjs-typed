import {RuleTester} from "@typescript-eslint/rule-tester";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup";
import rule from "./noDuplicateDecorators";
const tsRootDirectory = getFixturesRootDirectory();
const ruleTester = new RuleTester({
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2015,
        tsconfigRootDir: tsRootDirectory,
        project: "./tsconfig.json",
    },
});

ruleTester.run("no-duplicate-decorators", rule, {
    valid: [
        {
            code: `@DiscoverDecorator()
            class MyClass {
                @DiscoverDecorator()
                myProperty: string;

            }`,
        },
        {
            code: `@DiscoverDecorator()
            @NotValidated()
            @NotValidated()
            class MyClass {
                @DiscoverDecorator()
                myProperty: string;

            }`,
        },
    ],
    invalid: [
        {
            code: `@DiscoverDecorator()
        @DiscoverDecorator()
        class MyClass {
            @DiscoverDecorator()
            myProperty: string;

        }`,
            errors: [
                {
                    messageId: "noDuplicateDecorators",
                },
            ],
        },
        {
            code: `
        @DiscoverDecorator()
        class MyClass {
            @DiscoverDecorator()
            @DiscoverDecorator()
            myProperty: string;

        }`,
            errors: [
                {
                    messageId: "noDuplicateDecorators",
                },
            ],
        },
        {
            code: `
        @DiscoverDecorator()
        class MyClass {
            @Validated()
            @Validated()
            myProperty: string;

        }`,
            options: [{customList: ["Validated"]}],
            errors: [
                {
                    messageId: "noDuplicateDecorators",
                },
            ],
        },
    ],
});
