## api-method-should-specify-api-operation

A method decorated with @Get, @Post etc. should specify the expected ApiOperation e.g. @ApiOperation({description: ""}). These decorators are in the @nestjs/swagger npm package.

Passing

```ts
class TestClassA {
    @Get()
    @ApiOperation({description: "test description"})
    @ApiOkResponse({type: String, isArray: true})
    public getAll(): Promise<string[]> {
        return [];
    }
}

class TestClassB {
    @Get()
    @ApiOperation({description: "test description"})
    public getAll(): Promise<string[]> {
        return [];
    }
}
```

Failing

```ts
class TestClassD {
    @Get()
    public getAll(): Promise<string[]> {
        return [];
    }
}

class TestClassE {
    @All()
    public getAll(): Promise<string[]> {
        return [];
    }
}
```
