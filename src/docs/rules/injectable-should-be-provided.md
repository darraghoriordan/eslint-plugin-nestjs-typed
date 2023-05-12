### Rule: injectable-should-be-provided

Checks that a class marked with `@Injectable` is injected somewhere in a module or used in a provider.

NestJS will catch these at runtime but I prefer to get a nudge during development in my IDE. This will only check if the service is injected once. It won't check that the correct things are injected to the correct modules. So you might still get occasional runtime issues if you forget to import a module.

Fails if a thing marked as `@Injectable` is not in the `providers` of a module or `provides` in a provider.

This rule only works with ArrayExpression assignment for the lists of providers. e.g.

```
// This works ok. We assign an array directly to the providers

@Module({
    imports: [],
    providers: [MyProvider],
})
export class ProviderArrayModule {}
```

```
// the rule will not follow this type of assignment with a variable or import to check which providers are in the variable reference.

const providers = [ExampleProviderIncludedInModule];

@Module({
    imports: [],
    providers: providers,
})
export class ProviderArrayModule {}
```

There is some additional configuration you can (and should!) provide for this rule. This is the default setting. You should over ride this with your src directory and any strings to filter out from paths (note that the `filterFromPaths` are NOT globs - just matched strings).

```ts
    "@darraghor/nestjs-typed/injectable-should-be-provided": [
            "error",
            {
                src: ["src/**/*.ts"],
                filterFromPaths: ["node_modules", ".test.", ".spec."],
            },
        ],
```
