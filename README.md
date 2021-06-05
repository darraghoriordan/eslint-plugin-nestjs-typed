# Some eslint rules for working with NestJs projects

## To install

```
npm install --save-dev @darraghor/eslint-plugin-nestjs-typed
```

Then update your eslint with the plugin import and add the recommended rule set

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
    plugins: ["@darraghor/nestjs-typed"],
};

```

Note: the injectables test scans your whole project. It's best to filter out ts things that don't matter - use `filterFromPaths` configuration setting for this. There are some defaults already applied. See details below.

## Rules

### Rule: provided-injected-should-match-factory-parameters

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

### Rule: injectable-should-be-provided

Checks that a class marked with `@Injectable` is injected somewhere or used in a provider.

Fails if a thing marked as `@Injectable` is not in the `providers` of a module or `provides` in a provider.

There is some additional configuration you can provide for this rule. This is the default setting. You should overrride this with your src directory and any strings to filter out from paths (note that the filterFromPaths are NOT globs - just matched strings).

```ts
    "@darraghor/nestjs-typed/injectable-should-be-provided": [
            "error",
            {
                src: ["src/**/*.ts"],
                filterFromPaths: ["node_modules", ".test.", ".spec."],
            },
        ],
```
