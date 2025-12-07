### Rule: all-properties-have-explicit-defined

This rule checks that all properties of a class have an appropriate `@IsDefined()`, `@IsOptional()` or `@ValidateIf()` decorator.

This rule also checks that conflicting decorators are not used together. The following combinations are not allowed:
- `@IsDefined()` and `@IsOptional()` together
- `@IsOptional()` and `@ValidateIf()` together
- All three decorators together

However, `@ValidateIf()` can be combined with `@IsDefined()` on optional properties, as this is a valid pattern for conditional validation.

The rule will ignore any classes that have 0 class-validator decorators. This is to avoid errors for classes that are not used for validation.

This PASSES - all properties are decorated correctly

```ts
export class CreateOrganisationDto {
    @IsDefined()
    otherProperty!: MyClass;

    @IsOptional()
    someStringProperty?: string;

    @ValidateIf(o => !o.someStringProperty)
    @Length(10, 20)
    someOtherProperty?:  string
}
```

This PASSES - `@ValidateIf()` combined with `@IsDefined()` on optional property

```ts
export class CreateOrganisationDto {
    @ValidateIf((o) => !o.id)
    @IsDefined()
    @IsString()
    key?: string
}
```

This PASSES - no class validator decorators are used

```ts
export class CreateOrganisationDto {
    otherProperty!: MyClass;

    someStringProperty?: string;
}
```

This FAILS - missing `@IsOptional()` or `@ValidateIf()` on `someStringProperty`

```ts
export class CreateOrganisationDto {
    @IsDefined()
    otherProperty!: MyClass;
    @IsString()
    someStringProperty?: string;
}
```
