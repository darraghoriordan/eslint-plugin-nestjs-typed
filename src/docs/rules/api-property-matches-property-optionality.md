# Rule: api-property-matches-property-optionality

This checks that you have added the correct api property decorator for your swagger documents.

There are specific, distinct decorators for optional properties and mandatory properties.

Using the correct one affects Open Api doc generation.

This rule also checks for redundant `required: true` in `@ApiProperty` decorators, since properties are required by default.

## Options

```ts
{
    "checkRedundantRequired": true // default: true
}
```

- `checkRedundantRequired`: When enabled (default), the rule will report `required: true` in `@ApiProperty` as redundant since properties are required by default in Swagger/OpenAPI.

To disable this check:

```ts
{
    "@darraghor/nestjs-typed/api-property-matches-property-optionality": [
        "error",
        {
            "checkRedundantRequired": false
        }
    ]
}
```

## Failing examples

The following FAILS because this is an optional property and should have `@ApiPropertyOptional` — field has `?` but uses `@ApiProperty()`:

```ts
class TestClass {
    @Expose()
    @ApiProperty()
    thisIsAStringProp?: string;
}
```

The following FAILS because this is an optional property (union with undefined) and should have @ApiPropertyOptional:

```ts
class TestClass {
    @Expose()
    @ApiProperty()
    thisIsAStringProp: string | undefined;
}
```

New: The following FAILS because a class-field with a default value (initializer) is treated as optional from the DTO/API perspective and therefore should use @ApiPropertyOptional:

```ts
class TestClass {
    @Expose()
    @ApiProperty()
    thisIsAStringProp: string = "default";
}
```

New: The following FAILS because even with an initializer, using the optional modifier together with @ApiProperty() is inconsistent — should be @ApiPropertyOptional:

```ts
class TestClass {
    @Expose()
    @ApiProperty()
    thisIsAStringProp?: string = "default";
}
```

The following FAILS because this is a required property (definite assertion !) and should have @ApiProperty — from DTO transformation perspective it's not optional:

```ts
class TestClass {
    @Expose()
    @ApiPropertyOptional()
    thisIsAStringProp!: string;
}
```

The following FAILS because `required: true` is redundant in `@ApiProperty` (properties are required by default):

```ts
class TestClass {
    @Expose()
    @ApiProperty({ required: true })
    thisIsAStringProp!: string;
}
```

The following FAILS because `required: true` is redundant, even with other properties:

```ts
class TestClass {
    @Expose()
    @ApiProperty({ 
        required: true,
        description: 'A test property'
    })
    thisIsAStringProp!: string;
}
```

## Passing examples (valid)

The rule accepts these:

```ts
class TestClass {
    @Expose()
    @ApiPropertyOptional()
    thisIsAStringProp?: string;
}

class TestClass {
    @Expose()
    @ApiPropertyOptional()
    thisIsAStringProp: string | undefined;
}

class TestClass {
    @Expose()
    @ApiPropertyOptional()
    thisIsAStringProp: string = "default";
}

class TestClass {
    @Expose()
    @ApiProperty()
    thisIsAStringProp!: string;
}

class TestClass {
    @Expose()
    @ApiProperty({ description: 'A test property' })
    thisIsAStringProp!: string;
}
```

Note: If you want to allow `required: true` in `@ApiProperty`, you can disable the check:

```ts
{
    "@darraghor/nestjs-typed/api-property-matches-property-optionality": [
        "error",
        {
            "checkRedundantRequired": false
        }
    ]
}
```
