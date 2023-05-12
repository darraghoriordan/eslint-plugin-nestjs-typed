### Rule: controllers-should-supply-api-tags

If you have more than a handful of api methods the swagger UI is difficult to navigate. It's easier to group api methods by using tags.

This enforces api tags on controllers.

This PASSES because it has api tags

```ts
@ApiTags("my-group-of-methods")
@Controller("my-controller")
class TestClass {}
```

The following FAILS because it's missing api tags

```ts
@Controller("my-controller")
class TestClass {}
```
