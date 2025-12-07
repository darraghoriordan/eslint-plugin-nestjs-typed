## api-operation-summary-description-capitalized

The `summary` and `description` properties in `@ApiOperation` decorators should start with an uppercase letter for consistency and professionalism in API documentation.

This rule enforces that:
- The `summary` property starts with an uppercase letter
- The `description` property starts with an uppercase letter

This helps maintain consistent API documentation style across your NestJS application.

### Passing

```ts
class TestClass {
    @Post("logout")
    @ApiOperation({
        summary: "Clears the access-token cookie"
    })
    postLogout(@Res() res: Response) {
        return;
    }
}

class TestClass {
    @Get()
    @ApiOperation({
        description: "Returns all items"
    })
    public getAll(): Promise<string[]> {
        return [];
    }
}

class TestClass {
    @Get()
    @ApiOperation({
        summary: "Get all items",
        description: "This method returns all available items from the database"
    })
    public getAll(): Promise<string[]> {
        return [];
    }
}
```

### Failing

```ts
class TestClass {
    @Post("logout")
    @ApiOperation({
        summary: "clears the access-token cookie"  // Should start with 'C'
    })
    postLogout(@Res() res: Response) {
        return;
    }
}

class TestClass {
    @Get()
    @ApiOperation({
        description: "returns all items"  // Should start with 'R'
    })
    public getAll(): Promise<string[]> {
        return [];
    }
}

class TestClass {
    @Get()
    @ApiOperation({
        summary: "get all items",  // Should start with 'G'
        description: "this method returns all available items"  // Should start with 'T'
    })
    public getAll(): Promise<string[]> {
        return [];
    }
}
```
