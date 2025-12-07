### Rule: all-properties-are-whitelisted

You should forbid non-whitelisted properties in your DTOs.

If you have a DTO that has one property with a class-validator decorator, it's very unlikely that the same DTO will have any properties without a decorator - i.e. ALL DTO properties should be validated or explicitly whitelisted with `@Allow()`.

This rule will flag any properties that are not whitelisted as expected because it's probably a mistake.

#### Options

This rule accepts an options object with the following properties:

- `additionalDecorators` (optional): An array of custom decorator names that should be treated as class-validator decorators. This is useful when you have created custom validation decorators using `registerDecorator` from `class-validator`.

**Example configuration:**

```js
// eslint.config.js
export default [
    {
        rules: {
            "@darraghor/nestjs-typed/all-properties-are-whitelisted": [
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

This PASSES - all properties are decorated

```ts
export class CreateOrganisationDto {
    @ApiProperty({type: Person, isArray: true})
    @ValidateNested({each: true})
    members!: MyClass[];

    @ApiProperty()
    @Allow()
    otherProperty!: MyClass;

    @ApiProperty()
    @IsString()
    someStringProperty!: string;
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

This FAILS - one property here is missing a validation decorator. This is likely a mistake.

```ts
export class CreateOrganisationDto {
    @ApiProperty({type: Person, isArray: true})
    @ValidateNested({each: true})
    members!: MyClass[];

    @ApiProperty()
    otherProperty!: MyClass;
}
```
