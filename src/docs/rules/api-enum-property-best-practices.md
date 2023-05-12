### Rule: api-enum-property-best-practices

If you use enums on properties you should set the correct open api properties in the ApiProperty decorator.

If you don't use `enum` open api won't use the enum correctly.

If you don't use `enumName` then Open api will create a new enum for each api method. e.g. `ControllerNameEnumName`, This is awful to use as a consumer of a generated client.

You don't need to use `type:` any more. This used to be necessary in old versions to get enum strings correctly output.

The enumName should match the enum type you specify. It's easier to match them up when working on BE and FE. And it reduces chance for typos resulting in duplicate enums.

PASSES - This is a perfect enum description

```ts
class TestClass {
    @ApiPropertyOptional({enum: MyEnum, enumName: "MyEnum"})
    thisIsAnEnumProp?: MyEnum;
}
```

FAILS - you don't need type

```ts
class TestClass {
    @ApiPropertyOptional({type: MyEnum, enum: MyEnum, enumName: "MyEnum"})
    thisIsAnEnumProp?: MyEnum;
}
```

FAILS - you need to add a name

```ts
class TestClass {
    @ApiPropertyOptional({enum: MyEnum})
    thisIsAnEnumProp?: MyEnum;
}
```

FAILS - the enumName doesn't match the enumType

```ts
class MyClass {
    @ApiProperty({enumName: "MyEnumTYPO", enum: MyEnum})
    public myProperty!: MyEnum;
}
```
