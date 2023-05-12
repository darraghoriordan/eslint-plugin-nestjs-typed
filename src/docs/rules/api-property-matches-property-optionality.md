### Rule: api-property-matches-property-optionality

This checks that you have added the correct api property decorator for your swagger documents.

There are specific, distinct decorators for optional properties and mandatory properties.

Using the correct one affects Open Api doc generation.

The following FAILS because this is an optional property and should have `@ApiPropertyOptional`

```ts
class TestClass {
    @Expose()
    @ApiProperty()
    thisIsAStringProp?: string;
}
```

The following FAILS because this is an optional property and should have `@ApiPropertyOptional`

```ts
class TestClass {
    @Expose()
    @ApiProperty()
    thisIsAStringProp: string | undefined;
}
```

The following FAILS because this is a required property and should have `@ApiProperty`. It's not really an optional property but it is from an api DTO transformation perspective.

```ts
class TestClass {
    @Expose()
    @ApiPropertyOptional()
    thisIsAStringProp!: string;
}
```
