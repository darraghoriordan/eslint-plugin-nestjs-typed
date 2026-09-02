### Rule: forward-ref-injection-should-use-wrapper-type

When decorator metadata is emitted in an ESM application, using the same class
as both the `forwardRef()` target and the constructor parameter type can evaluate
the class before its module has initialized.

This rule is enabled by default in the recommended configuration.

#### ❌ This fails

```ts
constructor(
  @Inject(forwardRef(() => ProfileService))
  private readonly profileService: ProfileService,
) {}
```

#### ✅ This passes

Use a wrapper type so the direct class reference is not emitted as decorator
metadata, or preferably refactor the circular dependency.

```ts
export type WrapperType<T> = T;

constructor(
  @Inject(forwardRef(() => ProfileService))
  private readonly profileService: WrapperType<ProfileService>,
) {}
```

See the NestJS [SWC common pitfalls](https://docs.nestjs.com/recipes/swc#common-pitfalls)
and [circular dependency](https://docs.nestjs.com/fundamentals/circular-dependency)
documentation.
