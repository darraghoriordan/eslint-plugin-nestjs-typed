### Rule: all-properties-have-explicit-defined

This rule checks that all properties of a class have an appropriate `@IsDefined()`, `@IsOptional()` or `@ValidateIf()` decorator.

This rule also checks that both `@IsDefined()`, `@IsOptional()` and `@ValidatedIf` are not used on the same property because this doesn't make sense.

The rule will ignore any classes that have 0 class-validator decorators. This is to avoid errors for classes that are not used for validation.

This PASSES - all properties are decorated correctly

```ts
export class CreateOrganisationDto {
    @IsDefined()
    otherProperty!: MyClass;

    @IsOptional()
    someStringProperty?: string;

    @ValidatedIf(o => !o.someStringProperty)
    @Length(10, 20)
    someOtherProperty?:  string
}
```

This PASSES - no class validator decorators are used

```ts
export class CreateOrganisationDto {
    otherProperty!: MyClass;

    someStringProperty?: string;
}
```

This FAILS - missing `@IsOptional()` or `ValidateIf()` on `someStringProperty`

```ts
export class CreateOrganisationDto {
    @IsDefined()
    otherProperty!: MyClass;
    @IsString()
    someStringProperty?: string;
}
```
