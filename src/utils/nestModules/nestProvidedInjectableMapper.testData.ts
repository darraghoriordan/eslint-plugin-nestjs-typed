import {TSESLint} from "@typescript-eslint/utils";
import {NestProvidedInjectablesMap} from "./models/NestProvidedInjectablesMap";
export const fakeFilePath = "fake/path.ts";
export const fakeContext = {
    parserOptions: {
        ecmaVersion: 2019 as TSESLint.EcmaVersion,
        ecmaFeatures: {globalReturn: false},
        sourceType: "module",
    } as TSESLint.ParserOptions,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;
export const moduleMappingTestData = [
    {
        moduleCode: `import { Module } from "@nestjs/common";

    @Module({
        controllers: [MyController],
        providers: [
            MyProvider,
            MyInjectable,
        ],
        imports: [MyExternalModule, MySecondModule],
        exports: [MyInjectable],
    })
    export class MyModule {}`,
        expectedMapping: [
            fakeFilePath,
            new NestProvidedInjectablesMap(
                new Set(["MyController"]),
                new Set(["MyProvider", "MyInjectable"])
            ),
        ],
    },
    {
        moduleCode: `import { Provider } from "@nestjs/common";
import { MyOtherInjectable } from "./config/MyOtherInjectable";

export const MyOtherInjectableProvider: Provider = {
    provide: MyOtherInjectable,
    useFactory: async (
        config: MyService
    ): Promise<MyOtherInjectable> => {
        return new MyOtherInjectable()
    },
    inject: [MyService],
};`,
        expectedMapping: [
            fakeFilePath,
            new NestProvidedInjectablesMap(
                new Set([]),
                new Set(["MyOtherInjectable"])
            ),
        ],
    },
];
