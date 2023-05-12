### Rule: provided-injected-should-match-factory-parameters

Checks that there are the same number of injected items in a Provider that are passed to the factory method

PASSES because `Myservice` injected and `myservice` used in factory params

```ts
export const MyOtherInjectableProvider: NotAProvider = {
    provide: MyOtherInjectable,
    useFactory: async (config: MyService): Promise<MyOtherInjectable> => {
        return new MyOtherInjectable();
    },
    inject: [MyService],
};
```

FAILS because SecondService is not used in the factory - this is probably a developer error where they meant to inject the second service.

```ts
export const MyOtherInjectableProvider: Provider = {
    provide: MyOtherInjectable,
    useFactory: async (config: MyService): Promise<MyOtherInjectable> => {
        return new MyOtherInjectable();
    },
    inject: [MyService, SecondService],
};
```

FAILS because SecondService isn't injected in the factory - this is probably a developer error where they meant to inject the second service.

Of course you can ignore this warning if SecondService is `@Global()`

```ts
export const MyOtherInjectableProvider: Provider = {
    provide: MyOtherInjectable,
    useFactory: async (
        config: MyService,
        secondService: SecondService
    ): Promise<MyOtherInjectable> => {
        return new MyOtherInjectable();
    },
    inject: [MyService],
};
```
