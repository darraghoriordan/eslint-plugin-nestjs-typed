# Some eslint rules for working with NestJs projects

## To install

```
npm install @darraghor/eslint-plugin-nestjs-typed
```

To update your eslint with the plugin

```
module.exports = {
    env: {
        es6: true,
    },
    extends: ["plugin:@darraghor/nestjs-typed/recommended"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: ["./tsconfig.json"],
        sourceType: "module",
        ecmaVersion: "es2019",
    },
    rules: {
        "@darraghor/nestjs-typed/provided-injected-should-match-factory-parameters":
            "error",
        "@darraghor/nestjs-typed/injectable-should-be-provided": [
            "error",
            {
                src: ["src/**/*.ts"],
                filterFromPaths: ["node_modules", ".test.", ".spec."],
            },
        ],
    },
    plugins: ["@darraghor/nestjs-typed"],
};

```

Note: the injectables test scans your whole project. It's best to filter out ts things that don't matter - use `filterFromPaths` for this.

## Rules

### provided-injected-should-match-factory-parameters

Checks that there are the same number of injected items in a Provider that are passed to the factory method

Passes (Myservide injected and myservice used in factory params)

```ts
export const MyOtherInjectableProvider: NotAProvider = {
    provide: MyOtherInjectable,
    useFactory: async (config: MyService): Promise<MyOtherInjectable> => {
        return new MyOtherInjectable();
    },
    inject: [MyService],
};
```

Fails (SecondService is not used in the factory)

```ts
export const MyOtherInjectableProvider: Provider = {
    provide: MyOtherInjectable,
    useFactory: async (config: MyService): Promise<MyOtherInjectable> => {
        return new MyOtherInjectable();
    },
    inject: [MyService, SecondService],
};
```

### provided-injected-should-match-factory-parameters

Checks that a class marked with `@Injectable` is injected somewhere or used in a provider.

Fails if a thing marked as `@Injectable` is not in the `providers` of a module or `provides` in a provider.
