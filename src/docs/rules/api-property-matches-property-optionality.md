# Rule: api-property-matches-property-optionality

This checks that you have added the correct api property decorator for your swagger documents.

There are specific, distinct decorators for optional properties and mandatory properties.

Using the correct one affects Open Api doc generation.

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
```
