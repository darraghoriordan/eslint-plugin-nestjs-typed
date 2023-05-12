### Rule: api-methods-should-be-guarded

If you require authentication, and don't use a global guard, you should be explicit about how each controller or endpoint is protected, and a UseGuards annotation should cover each.

NOTE: This rule is context-dependent (i.e. it'll generate useless noise if you've got a global guard) and so is OFF by default. It will need manually enabling in the rules section of your eslint config with `"@darraghor/nestjs-typed/api-methods-should-be-guarded": "error"`.

This PASSES - endpoint is protected by an AuthGuard

```ts
class TestClass {
    @Get()
    @UseGuards(AuthGuard('jwt'))
    public getAll(): Promise<string[]> {
        return [];
    }
}`
```

This PASSES - entire controller is protected by an AuthGuard

```ts
@UseGuards(AuthGuard("jwt"))
class TestClass {
    @Get()
    public getAll(): Promise<string[]> {
        return [];
    }

    @Get()
    public getOne(): Promise<string> {
        return "1";
    }
}
```

This PASSES - endpoint is protected by a custom Guard

```ts
class TestClass {
    @Post()
    @UseGuards(MyCustomGuard("hand-gestures"))
    public getAll(): Promise<string[]> {
        return [];
    }
}
```

This PASSES - it isn't a controller or an endpoint

```ts
class TestClass {
    public getAll(): Promise<string[]> {
        return [];
    }
}
```

This FAILS - neither the controller nor the endpoint is protected with a guard

```ts
class TestClass {
    @Get()
    public getAll(): Promise<string[]> {
        return [];
    }
}
```
