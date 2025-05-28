### Rule: validated-non-primitive-property-needs-type-decorator

If you use any of the class validator decorators on a property that is not a primitive, you should tell class-transformer how to transform it into a class first.

This rule accepts 2 options:

-   `additionalTypeDecorators`: string list of custom type decorators that will be counted as valid for the rule test e.g.

    ```ts
    "@darraghor/nestjs-typed/validated-non-primitive-property-needs-type-decorator": [
            "error",
            {additionalTypeDecorators: ["TransformDate"]},
        ],
    ```

-   `additionalCustomValidatorDecorators`: string list of custom class-validator decorators which will get recognized as a validator by the plugin. This is especially useful if you have created your own validator outside of the standard ones provided by the library. The example below prevents errors from being raised by the linter if we use the `@IsDateRange` validator on a class property.

    ```ts
    "@darraghor/nestjs-typed/validated-non-primitive-property-needs-type-decorator": [
            "error",
            {additionalCustomValidatorDecorators: ["IsDateRange"]},
        ],
    ```

This PASSES because we're validating a Person class and we have added the @Type decorator.

```ts
export class CreateOrganizationDto {
    @ApiProperty({type: Person, isArray: true})
    @IsDefined()
    @Type(() => Person)
    members!: Person;
}
```

This PASSES because it is a primitive type (boolean, string, number). We don't need to tell class-transformer how to transform those.

```ts
export class CreateOrganizationDto {
    @ApiProperty({type: Person, isArray: true})
    @ValidateNested({each: true})
    @IsBoolean()
    members!: boolean;
}
```

This PASSES because we only check properties that have a class-validator decorator (e.g. `@IsDefined()`)

```ts
export class CreateOrganizationDto {
    @ApiProperty({type: Person, isArray: true})
    members!: Person | Date;
}
```

This PASSES because it is a primitive array. These don't need `@Type()` decorators.

```ts
class ExampleDto {
    @ApiProperty({
      isArray: true,
    })
    @Allow()
    exampleProperty!: string[];
  }
```

This FAILS because you should always tell class-transformer the type for an array

```ts
export class CreateOrganizationDto {
    @ApiProperty({type: Person, isArray: true})
    @ValidateNested({each: true})
    @IsArray()
    members!: (Person | Date)[];
}
```

This FAILS because Date is not a primitive type (string, number, boolean)

```ts
export class CreateOrganizationDto {
    @ApiProperty({type: Person, isArray: true})
    @ValidateNested({each: true})
    @IsDate()
    members!: Date;
}
```
