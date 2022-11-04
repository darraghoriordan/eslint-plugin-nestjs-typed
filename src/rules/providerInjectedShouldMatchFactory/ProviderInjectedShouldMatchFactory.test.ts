import {ESLintUtils} from "@typescript-eslint/utils";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup";
import rule from "./ProviderInjectedShouldMatchFactory";

const tsRootDirectory = getFixturesRootDirectory();
const ruleTester = new ESLintUtils.RuleTester({
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2015,
        tsconfigRootDir: tsRootDirectory,
        project: "./tsconfig.json",
    },
});

ruleTester.run("provided-injected-should-match-factory-parameters", rule, {
    valid: [
        {
            code: `export const MyOtherInjectableProvider: Provider = {
                provide: MyOtherInjectable,
                useFactory: async (
                    config: MyService
                ): Promise<MyOtherInjectable> => {
                    return new MyOtherInjectable()
                },
                inject: [MyService],
            };`,
        },
        {
            code: `export const MyOtherInjectableProvider: NotAProvider = {
                provide: MyOtherInjectable,
                useFactory: async (
                    config: MyService
                ): Promise<MyOtherInjectable> => {
                    return new MyOtherInjectable()
                },
                inject: [MyService],
            };`,
        },
        {
            code: `export const MyOtherInjectableProvider: Provider = {
                provide: MyOtherInjectable,
                useFactory: async (
                ): Promise<MyOtherInjectable> => {
                    return new MyOtherInjectable()
                },
                inject: [],
            };`,
        },
        {
            code: `export const MyOtherInjectableProvider: Provider = {
            provide: MyOtherInjectable,
            useFactory: async (
            ): Promise<MyOtherInjectable> => {
                return new MyOtherInjectable()
            }
        };`,
        },
    ],
    invalid: [
        {
            code: `export const MyOtherInjectableProvider: Provider = {
                provide: MyOtherInjectable,
                useFactory: async (
                    config: MyService
                ): Promise<MyOtherInjectable> => {
                    return new MyOtherInjectable()
                },
                inject: [MyService,SecondService],
            };`,
            errors: [
                {
                    messageId: "mainMessage",
                },
            ],
        },
        {
            code: `export const MyOtherInjectableProvider: Provider = {
                provide: MyOtherInjectable,
                useFactory: async (
                    config: MyService,
                    configTwo: MySecondService
                ): Promise<MyOtherInjectable> => {
                    return new MyOtherInjectable()
                },
                inject: [MyService],
            };`,
            errors: [
                {
                    messageId: "mainMessage",
                },
            ],
        },
    ],
});
