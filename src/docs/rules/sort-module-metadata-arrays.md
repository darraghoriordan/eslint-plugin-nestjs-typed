### Rule: sort-module-metadata-arrays

This rule ensures your module arrays are sorted in alphabetical ASC order.

It only works on one entry at a time so if you're adding this to an existing project you might need to smash "fix" a few times to clear the errors and sort your arrays. After this it should just warn as you add new items to the array(s).

The rule will also sort Call Expressions as these are commonly used in NestJS e.g. `MyModule.forRoot(...)`.

Please note that this rule is `OFF` by default. To turn it on, add it to your eslint configuration.

You can supply a locale in the options if the default `en-US` doesn't work for you.

```ts
    "@darraghor/nestjs-typed/sort-module-metadata-arrays": [
            "warn",
            {
                locale: "en-AU"
            },
        ],
```

The following code will fail this rule because `imports` has `AuthzModule` at the end and so it is not alphabetical ASC.

```ts
@Module({
    imports: [
        CoreModule,
        DatabaseModule,
        OpenTelemetryModule.forRoot({
            metrics: {
                hostMetrics: true,
                apiMetrics: {
                    enable: true,
                },
            },
        }),
        UserInternalModule,
        AuthzModule,
    ],
    controllers: [AController, BController],
    providers: [AProvider, BProvider],
})
export class MainModule {}
```

The following code will pass because all arrays are alphabetical ASC.

```ts
@Module({
    imports: [
        AuthzModule,
        CoreModule,
        DatabaseModule,
        OpenTelemetryModule.forRoot({
            metrics: {
                hostMetrics: true,
                apiMetrics: {
                    enable: true,
                },
            },
        }),
        UserInternalModule,
    ],
    controllers: [AController, BController],
    providers: [AProvider, BProvider],
})
export class MainModule {}
```
