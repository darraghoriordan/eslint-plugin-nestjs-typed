### Rule: no-duplicate-decorators

Some decorators should not be applied twice on a property or class. Often only the first or last instance of the decorator will be used. This rule will flag any duplicate decorators that it knows will cause issues.

Configuration

This rule can be configured. Note: If you specify a custom list this will overwrite ALL of the default configured decorators. You have to specify all of the decorators you want to check.

```ts
    "@darraghor/nestjs-typed/no-duplicate-decorators": [
            "error",
            {customList: ["SomeValidatedDecoratorName", "DiscoverDecorator"]},
        ],
```

This PASSES - all properties or classes are decorated once

```ts
@DiscoverDecorator()
class MyClass {
    @DiscoverDecorator()
    myProperty: string;
}
```

This FAILS - one property here has an invalid decorator applied twice

```ts
@DiscoverDecorator()
class MyClass {
    @DiscoverDecorator()
    @DiscoverDecorator()
    myProperty: string;
}
```
