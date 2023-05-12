### Rule: all-properties-are-whitelisted

You should forbid non-whitelisted properties in your DTOs.

If you have a DTO that has one property with a class-validator decorator, it's very unlikely that the same DTO will have any properties without a decorator - i.e. ALL DTO properties should be validated or explicitly whitelisted with `@Allow()`.

This rule will flag any properties that are not whitelisted as expected because it's probably a mistake.

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
