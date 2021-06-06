# Some eslint rules for working with NestJs projects

## Why

### Nest Dependency Injection

There are some things you don't want to forget when working with Nest dependency injection.

The Nest DI is declarative and if you forget to provide an injectable you wont see an error until run time.

If you're using custom providers the errors can be really tricky to figure out because they won't explicitly error about mismatched injected items, you will just get unexpected operation.

### Open Api / Swagger and automatically generating a client for front end

When working with NestJS I generate my front end models using the swagger generated from the nest controllers and models. I have a bunch of rules that are mostly for strict typing for those controllers and models.

They are somewhat opinionated but necessary for clean model generation if using an Open Api model generator.

## Rule list (more details for each rule below)

Nest Modules

-   provided-injected-should-match-factory-parameters
-   injectable-should-be-provided

Nest Swagger

-   api-property-matches-property-optionality
-   controllers-should-supply-api-tags
-   api-method-should-specify-api-operation
-   api-enum-property-best-practices
-   api-property-returning-array-should-set-array

## To install

```
npm install --save-dev @darraghor/eslint-plugin-nestjs-typed
```

Then update your eslint with the plugin import and add the recommended rule set

```ts
module.exports = {
    env: {
        es6: true,
    },
    extends: ["plugin:@darraghor/nestjs-typed/recommended"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: ["./tsconfig.json"],
        sourceType: "module",
        ecmaVersion: "es2019",
    },
    plugins: ["@darraghor/nestjs-typed"],
};
```

Note: the injectables test scans your whole project. It's best to filter out ts things that don't matter - use `filterFromPaths` configuration setting for this. There are some defaults already applied. See details below.

Note: You can easily turn off all the swagger rules if you don't use swagger by adding the `no-swagger` rule set AFTER the recommended rule set.

```ts
// all the other config
    extends: ["plugin:@darraghor/nestjs-typed/recommended",
    "plugin:@darraghor/nestjs-typed/no-swagger"
    ],
    // more config
```

## Rules

### Rule: provided-injected-should-match-factory-parameters

Checks that there are the same number of injected items in a Provider that are passed to the factory method

Passes (Myservide injected and myservice used in factory params)

```ts
export const MyOtherInjectableProvider: NotAProvider = {
    provide: MyOtherInjectable,
    useFactory: async (config: MyService): Promise<MyOtherInjectable> => {
        return new MyOtherInjectable();
    },
    inject: [MyService],
};
```

Fails (SecondService is not used in the factory)

```ts
export const MyOtherInjectableProvider: Provider = {
    provide: MyOtherInjectable,
    useFactory: async (config: MyService): Promise<MyOtherInjectable> => {
        return new MyOtherInjectable();
    },
    inject: [MyService, SecondService],
};
```

### Rule: injectable-should-be-provided

Checks that a class marked with `@Injectable` is injected somewhere or used in a provider.

Fails if a thing marked as `@Injectable` is not in the `providers` of a module or `provides` in a provider.

There is some additional configuration you can provide for this rule. This is the default setting. You should overrride this with your src directory and any strings to filter out from paths (note that the filterFromPaths are NOT globs - just matched strings).

```ts
    "@darraghor/nestjs-typed/injectable-should-be-provided": [
            "error",
            {
                src: ["src/**/*.ts"],
                filterFromPaths: ["node_modules", ".test.", ".spec."],
            },
        ],
```

### Rule: api-property-matches-property-optionality

This checks that you have added the correct api property decorator for your swagger documents.

There are specific decorators for optional properties and using the correct one affects Open Api generation.

The following FAILS because this is an optional property and should have `@ApiPropertyOptional`

```ts
class TestClass {
    @Expose()
    @ApiProperty()
    thisIsAStringProp?: string;
}
```

The following FAILS because this is a required property and should have `@ApiProperty`

```ts
class TestClass {
    @Expose()
    @ApiPropertyOptional()
    thisIsAStringProp!: string;
}
```

### Rule: controllers-should-supply-api-tags

If you have more than a handful of api methods the swagger UI is difficult to navigate. It's easier to group api methods by using tags.

This PASSES because it has api tags

```ts
@ApiTags("my-group-of-methods")
@Controller("my-controller")
class TestClass {}
```

The following FAILS because it's missing api tags

```ts
@Controller("my-controller")
class TestClass {}
```

### Rule: api-method-should-specify-api-operation

If you have an api method like @Get() you should specify the return status code (and type!) by using @ApiOkResponse and the other expected responses. I often leave out 400s and 500s because it's kind of assumed but they should be used if the return type changes!

This PASSES

```ts
class TestClass {
    @Get()
    @ApiOkResponse({type: String, isArray: true})
    @ApiBadRequestResponse({description: "Bad Request"})
    public getAll(): Promise<string[]> {
        return [];
    }
}
```

The following FAILS because it's missing api operation decorators

```ts
class TestClass {
    @Get()
    public getAll(): Promise<string[]> {
        return [];
    }
}
```

### Rule: api-enum-property-best-practices

If you use enums you should set the correct properties in the ApiProperty decorator. Note I don't actually check the types on the property, I only check properties where `enum: EnumType` is already set to make sure they are set correctly.

If you don't use enumName then Open api will create a new enum for each api method. This is awful to use in a generated client.
You don't need to use type any more. This used to be necessary in old versions to get enum strings correctly output.

This is perfect

```ts
class TestClass {
    @ApiPropertyOptional({enum: MyEnum, enumName: "MyEnum"})
    thisIsAnEnumProp!: MyEnum;
}
```

Fails - you don't need type

```ts
class TestClass {
    @ApiPropertyOptional({type: MyEnum, enum: MyEnum, enumName: "MyEnum"})
    thisIsAnEnumProp!: MyEnum;
}
```

Fails - you need to add a name

```ts
class TestClass {
    @ApiPropertyOptional({enum: MyEnum})
    thisIsAnEnumProp!: MyEnum;
}
```

### Rule: api-property-returning-array-should-set-array

If you return an array you should indicate this in the api property. There are two ways to do this

`ApiProperty({type:[String]}) OR ApiProperty({type:String, isArray:true})`

I enforce the second long way! You can turn this off if you prefer the shorthand way but you won't get warned if you missed the array specification.

This passes

```ts
class TestClass {
    @ApiPropertyOptional({enumName: "MyEnum" isArray:true})
    thisIsAProp!: MyEnum[];
}
```

This passes

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
