### Rule: all-properties-have-explicit-defined

This rule checks that all properties of a class have an appropriate `@IsDefined()`, `@IsOptional()` or `@ValidateIf()` decorator.

This rule also checks that conflicting decorators are not used together. The following combinations are not allowed:
- `@IsDefined()` and `@IsOptional()` together
- `@IsOptional()` and `@ValidateIf()` together
- All three decorators together

However, `@ValidateIf()` can be combined with `@IsDefined()` on optional properties, as this is a valid pattern for conditional validation.

The rule will ignore any classes that have 0 class-validator decorators. This is to avoid errors for classes that are not used for validation.

#### Options

This rule accepts an options object with the following properties:

- `additionalDecorators` (optional): An array of custom decorator names that should be treated as class-validator decorators. This is useful when you have created custom validation decorators using `registerDecorator` from `class-validator`.

**Example configuration:**

```js
// eslint.config.js
export default [
    {
        rules: {
            "@darraghor/nestjs-typed/all-properties-have-explicit-defined": [
                "error",
                {
                    additionalDecorators: ["IsValidLoginIdentifier", "MyCustomValidator"]
                }
            ]
        }
    }
];
```

#### Examples

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

This PASSES - custom decorator with configuration

```ts
export class LoginDto {
    @IsValidLoginIdentifier()
    identifier: string;

    @IsString()
    password: string;
}
```

With configuration:
```js
{
    additionalDecorators: ["IsValidLoginIdentifier"]
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
