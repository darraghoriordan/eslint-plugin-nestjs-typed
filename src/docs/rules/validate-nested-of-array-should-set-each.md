### Rule: validate-nested-of-array-should-set-each

If you use the `@ValidateNested` decorator you should specify the `{each: true}` option if the property is an array.

This PASSES because it's an array and each is set

```ts
export class CreateOrganisationDto {
    @ApiProperty({type: Person, isArray: true})
    @ValidateNested({each: true})
    members!: MyClass[];
}
```

This PASSES because it's an array and each is set

```ts
export class CreateOrganisationDto {
    @ApiProperty({type: Person, isArray: true})
    @ValidateNested({each: true})
    members!: Array<MyClass>;
}
```

This PASSES because it's not an array and each is not set

```ts
export class CreateOrganisationDto {
    @ApiProperty({type: Person, isArray: true})
    @ValidateNested()
    members!: MyClass;
}
```

This FAILS because it's not an array and each is set

```ts
export class CreateOrganisationDto {
    @ApiProperty({type: Person, isArray: true})
    @ValidateNested({each: true})
    members!: MyClass;
}
```
