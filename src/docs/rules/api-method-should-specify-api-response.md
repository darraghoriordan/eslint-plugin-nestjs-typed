### Rule: api-method-should-specify-api-response

If you have an api method like @Get() you should specify the return status code (and type!) by using @ApiResponse and the other expected responses.

Note: I often leave out 400s and 500s because it's kind of assumed, but these decorators should be used if the return type changes in your api for 400/500 etc!

**This rule accepts options:**

- `additionalCustomApiResponseDecorators`: string list of custom api response decorators that will be counted as valid for the rule test e.g.

    ```ts
    "@darraghor/nestjs-typed/api-method-should-specify-api-response": [
            "error",
            {additionalCustomApiResponseDecorators: ["ApiPaginatedResponse"]},
        ],
    ```

This PASSES

```ts
class TestClass {
    @Get()
    @ApiResponse({status: 200, type: String})
    @ApiBadRequestResponse({description: "Bad Request"})
    public getAll(): Promise<string[]> {
        return [];
    }
}
```

The following FAILS because it's missing api response decorators

```ts
class TestClass {
    @Get()
    public getAll(): Promise<string[]> {
        return [];
    }
}
```
