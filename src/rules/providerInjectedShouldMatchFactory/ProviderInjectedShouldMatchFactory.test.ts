import {RuleTester} from "@typescript-eslint/rule-tester";
import {getFixturesRootDirectory} from "../../testing/fixtureSetup";
import rule from "./ProviderInjectedShouldMatchFactory";

const tsRootDirectory = getFixturesRootDirectory();
const ruleTester = new RuleTester({
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
        {
            // should not fail on this code, unrelated to provider injection
            code: `searchProvidersReturn = (providers: IdeonProvider[]) => {
                return providers.map((provider) => {
                  const entity: Provider = { // THIS LINE
                    id: provider.id,
                    firstName: provider.first_name,
                    middleName: provider.middle_name,
                    lastName: provider.last_name,
                    suffix: provider.suffix,
                    title: provider.title,
                    presentationName: provider.presentation_name,
                    gender: provider.gender,
                    npis: provider.npis,
                    phone: provider.phone,
                    email: provider.email,
                    specialty: provider.specialty,
                    addresses: provider.addresses,
                  };
                  return entity;
                });
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
