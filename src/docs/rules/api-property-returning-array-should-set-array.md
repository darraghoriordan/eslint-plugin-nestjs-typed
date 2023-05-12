### Rule: api-property-returning-array-should-set-array

If you return an array you should indicate this in the api property. There are two ways to do this

`ApiProperty({type:[String]}) OR ApiProperty({type:String, isArray:true})`

I enforce the second long way! You can turn this rule off if you prefer the shorthand way, but you won't get warned if you missed the array specification.

This PASSES - property is array and specifies isArray

```ts
class TestClass {
    @ApiPropertyOptional({enumName: "MyEnum" isArray:true})
    thisIsAProp!: MyEnum[];
}
```

This PASSES - property is array and specifies isArray

```ts
class TestClass {
    @ApiPropertyOptional({type: String, isArray: true})
    thisIsAProp!: Array<string>;
}
```

This FAILS - missing isArray

```ts
class TestClass {
    @ApiPropertyOptional({type: String})
    thisIsAProp!: Array<string>;
}
```

This FAILS - doesn't need isArray

```ts
class TestClass {
    @ApiPropertyOptional({type: String, isArray: true})
    thisIsAProp!: string;
}
```
