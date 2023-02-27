![commit](https://badgen.net/github/last-commit/darraghoriordan/eslint-plugin-nestjs-typed/main)
![npm](https://img.shields.io/npm/v/@darraghor/eslint-plugin-nestjs-typed.svg?color=red)
![npm-tag](https://badgen.net/github/tag/darraghoriordan/eslint-plugin-nestjs-typed)
![size](https://badgen.net/bundlephobia/minzip/@darraghor/eslint-plugin-nestjs-typed?color=cyan)
![types](https://badgen.net/npm/types/@darraghor/eslint-plugin-nestjs-typed?color=blue)

## A note on versions

Version 2.x supports Eslint version <=7.x and typescript eslint parser 4

Version 3.x supports Eslint version >=8.x and typescript eslint parser 5+

There were many breaking changes between these versions.

typescript eslint parser supports a range of typescript versions but there can be a delay in supporting the latest versions.

This plugin only supports typescript up to the version typescript eslint parser supports. See https://github.com/typescript-eslint/typescript-eslint#supported-typescript-version for the versions.

## Index of available rules

(more details for each specific rule are available in sections below)

Nest Modules and Dependency Injection

-   provided-injected-should-match-factory-parameters
-   injectable-should-be-provided

Nest Swagger

-   api-property-matches-property-optionality
-   controllers-should-supply-api-tags
-   api-method-should-specify-api-response
-   api-enum-property-best-practices
-   api-property-returning-array-should-set-array

Preventing bugs

-   param-decorator-name-matches-route-param
-   validate-nested-of-array-should-set-each
-   validated-non-primitive-property-needs-type-decorator
-   all-properties-are-whitelisted
-   all-properties-have-explicit-defined

Security

-   should-specify-forbid-unknown-values
-   api-methods-should-be-guarded

## Why use this package?

If you use NestJs (https://nestjs.com/) then these rules will help you to prevent common bugs and issues. They mostly check that you are using decorators correctly.

See the following summaries

### 1. Detect Nest Dependency Injection issues

There are some things you don't want to forget when working with Nest dependency injection...

The Nest DI is declarative and if you forget to provide an injectable you wont see an error until run time. Nest is good at telling you where these are but sometimes it's not.

In particular if you're using custom providers the errors can be really tricky to figure out because they won't explicitly error about mismatched injected items, you will just get unexpected operation.

These are described in the "Common Errors" section of the nest js docs.

### 2. Using Open Api / Swagger decorators and automatically generating a clients

When working with NestJS I generate my front end client and models using the swagger generated from the nest controllers and models.

I have a bunch of rules here that are mostly for strict typing with decorators for those controllers and models.

These rules are somewhat opinionated, but necessary for clean model generation if using an Open Api model generator.

### 3. Helping prevent bugs

There are some tightly coupled but untyped decorators and things like that in nest that will catch you out if your not careful. There are some rules to help prevent issues that have caught me out before.

### 4. Security

There is a CVE for class-transformer when using random javascript objects. You need to be careful about configuring the ValidationPipe in NestJs. See
https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-18413
https://github.com/typestack/class-validator/issues/438

## To install

```
npm install --save-dev @darraghor/eslint-plugin-nestjs-typed

// or

yarn add -D @darraghor/eslint-plugin-nestjs-typed
```

If you don't already have `class-validator` you should install that

```
npm install class-validator

// or
yarn add class-validator
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

Disable a single rule with the full name e.g. in your eslint configuration...

```
   rules: {
   "@darraghor/nestjs-typed/api-property-returning-array-should-set-array":
            "off",
   }
```

## Rule Details

### Rule: all-properties-have-explicit-defined

This rule checks that all properties of a class have an appropriate `@IsDefined()` or `@IsOptional()` decorator.

This rule also checks that both `@IsDefined()` and `@IsOptional()` are not used on the same property because this doesn't make sense.

The rule will ignore any classes that have 0 class-validator decorators. This is to avoid errors for classes that are not used for validation.

This PASSES - all properties are decorated correctly

```ts
export class CreateOrganisationDto {
    @IsDefined()
    otherProperty!: MyClass;

    @IsOptional()
    someStringProperty?: string;
}
```

This PASSES - no class validator decorators are used

```ts
export class CreateOrganisationDto {
    otherProperty!: MyClass;

    someStringProperty?: string;
}
```

This FAILS - missing `@IsOptional()` on `someStringProperty`

```ts
export class CreateOrganisationDto {
    @IsDefined()
    otherProperty!: MyClass;
    @IsString()
    someStringProperty?: string;
}
```

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
export class CreateOrganisationDto {
    @ApiProperty({type: Person, isArray: true})
    @IsDefined()
    @Type(() => Person)
    members!: Person;
}
```

This PASSES because it is a primitive type (boolean, string, number). We don't need to tell class-transformer how to transform those.

```ts
export class CreateOrganisationDto {
    @ApiProperty({type: Person, isArray: true})
    @ValidateNested({each: true})
    @IsBoolean()
    members!: boolean;
}
```

This PASSES because we only check properties that have a class-validator decorator (e.g. `@IsDefined()`)

```ts
export class CreateOrganisationDto {
    @ApiProperty({type: Person, isArray: true})
    members!: Person | Date;
}
```

This PASSES because it is a primitive array. These don't need `@Type()` decorators.

````ts
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
export class CreateOrganisationDto {
    @ApiProperty({type: Person, isArray: true})
    @ValidateNested({each: true})
    @IsArray()
    members!: (Person | Date)[];
}
````

This FAILS because Date is not a primitive type (string, number, boolean)

```ts
export class CreateOrganisationDto {
    @ApiProperty({type: Person, isArray: true})
    @ValidateNested({each: true})
    @IsDate()
    members!: Date;
}
```

### Rule: param-decorator-name-matches-route-param

This rule will verify you have entered a `Param("name")` that has a matching url parameter in a controller or method decorator

NOTE: nestjs allows for fuzzy matching params in paths with `_+?()*` as regex params. This rule doesn't support parsing paths with regex so we will ignore any routes with these characters in them.

this PASSES because the uuid param is in the `Get()` decorator

```ts
@Controller("custom-bot")
export class CustomBotController {
    constructor() {}

    @Get(":uuid")
    @ApiOkResponse({type: CustomBot})
    findOne(
        @Param("uuid") uuid: string,
        @Request() request: RequestWithUser
    ): Promise<CustomBot> {
        return this.customBotService.findOne(uuid, request.user.uuid);
    }
}
```

this PASSES because the uuid param is in the `Controller()` decorator

```ts
@Controller("custom-bot/:uuid")
export class CustomBotController {
    constructor() {}

    @Get()
    @ApiOkResponse({type: CustomBot})
    findOne(
        @Param("uuid") uuid: string,
        @Request() request: RequestWithUser
    ): Promise<CustomBot> {
        return this.customBotService.findOne(uuid, request.user.uuid);
    }
}
```

This FAILS because there is a typo in the param decorator

```ts
@Controller("custom-bot")
export class CustomBotController {
    constructor() {}

    @Get(":uuid")
    @ApiOkResponse({type: CustomBot})
    findOne(
        @Param("uui") uuid: string,
        @Request() request: RequestWithUser
    ): Promise<CustomBot> {
        return this.customBotService.findOne(uuid, request.user.uuid);
    }
}
```

this FAILS because you shouldn't put the `:` in the param decorator

```ts
@Controller("custom-bot")
export class CustomBotController {
    constructor() {}

    @Get(":uuid")
    @ApiOkResponse({type: CustomBot})
    findOne(
        @Param(":uuid") uuid: string,
        @Request() request: RequestWithUser
    ): Promise<CustomBot> {
        return this.customBotService.findOne(uuid, request.user.uuid);
    }
}
```

### Rule: should-specify-forbid-unknown-values

This checks when if you are setting ValidationPipe parameters you set forbidUnknownValues to true.

There is a CVE for class-transformer when using random javascript objects. You need to be careful about configuring the ValidationPipe in NestJs. See
https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-18413
https://github.com/typestack/class-validator/issues/438

e.g. this PASSES because the property is set

```ts
const validationPipeB = new ValidationPipe({
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
});
```

this FAILS because property is not set

```ts
const validationPipeB = new ValidationPipe({
    forbidNonWhitelisted: true,
});
```

this FAILS because property is set to false

```ts
const validationPipeB = new ValidationPipe({
    forbidNonWhitelisted: false,
});
```

this PASSES because the default values seem to work ok

```ts
const validationPipeB = new ValidationPipe();
```

### Rule: provided-injected-should-match-factory-parameters

Checks that there are the same number of injected items in a Provider that are passed to the factory method

PASSES because `Myservice` injected and `myservice` used in factory params

```ts
export const MyOtherInjectableProvider: NotAProvider = {
    provide: MyOtherInjectable,
    useFactory: async (config: MyService): Promise<MyOtherInjectable> => {
        return new MyOtherInjectable();
    },
    inject: [MyService],
};
```

FAILS because SecondService is not used in the factory - this is probably a developer error where they meant to inject the second service.

```ts
export const MyOtherInjectableProvider: Provider = {
    provide: MyOtherInjectable,
    useFactory: async (config: MyService): Promise<MyOtherInjectable> => {
        return new MyOtherInjectable();
    },
    inject: [MyService, SecondService],
};
```

FAILS because SecondService isn't injected in the factory - this is probably a developer error where they meant to inject the second service.

Of course you can ignore this warning if SecondService is `@Global()`

```ts
export const MyOtherInjectableProvider: Provider = {
    provide: MyOtherInjectable,
    useFactory: async (
        config: MyService,
        secondService: SecondService
    ): Promise<MyOtherInjectable> => {
        return new MyOtherInjectable();
    },
    inject: [MyService],
};
```

### Rule: injectable-should-be-provided

Checks that a class marked with `@Injectable` is injected somewhere in a module or used in a provider.

NestJS will catch these at runtime but I prefer to get a nudge during development in my IDE. This will only check if the service is injected once. It won't check that the correct things are injected to the correct modules. So you might still get occasional runtime issues if you forget to import a module.

Fails if a thing marked as `@Injectable` is not in the `providers` of a module or `provides` in a provider.

This rule only works with ArrayExpression assignment for the lists of providers. e.g.

```
// This works ok. We assign an array directly to the providers

@Module({
    imports: [],
    providers: [MyProvider],
})
export class ProviderArrayModule {}
```

```
// the rule will not follow this type of assignment with a variable or import to check which providers are in the variable reference.

const providers = [ExampleProviderIncludedInModule];

@Module({
    imports: [],
    providers: providers,
})
export class ProviderArrayModule {}
```

There is some additional configuration you can (and should!) provide for this rule. This is the default setting. You should over ride this with your src directory and any strings to filter out from paths (note that the `filterFromPaths` are NOT globs - just matched strings).

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

There are specific, distinct decorators for optional properties and mandatory properties.

Using the correct one affects Open Api doc generation.

The following FAILS because this is an optional property and should have `@ApiPropertyOptional`

```ts
class TestClass {
    @Expose()
    @ApiProperty()
    thisIsAStringProp?: string;
}
```

The following FAILS because this is an optional property and should have `@ApiPropertyOptional`

```ts
class TestClass {
    @Expose()
    @ApiProperty()
    thisIsAStringProp: string | undefined;
}
```

The following FAILS because this is a required property and should have `@ApiProperty`. It's not really an optional property but it is from an api DTO transformation perspective.

```ts
class TestClass {
    @Expose()
    @ApiPropertyOptional()
    thisIsAStringProp!: string;
}
```

### Rule: controllers-should-supply-api-tags

If you have more than a handful of api methods the swagger UI is difficult to navigate. It's easier to group api methods by using tags.

This enforces api tags on controllers.

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

### Rule: api-method-should-specify-api-response

If you have an api method like @Get() you should specify the return status code (and type!) by using @ApiResponse and the other expected responses.

Note: I often leave out 400s and 500s because it's kind of assumed, but these decorators should be used if the return type changes in your api for 400/500 etc!

This PASSES

```ts
class TestClass {
    @Get()
    @ApiResponse({status: 200, type: String})
    @ApiBadRequestResponse({description: "Bad Request"})
    public getAll(): Promise<string[]> {
        return [];
    }
}
```

The following FAILS because it's missing api response decorators

```ts
class TestClass {
    @Get()
    public getAll(): Promise<string[]> {
        return [];
    }
}
```

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

### Rule: api-methods-should-be-guarded

If you require authentication, and don't use a global guard, you should be explicit about how each controller or endpoint is protected, and a UseGuards annotation should cover each.

NOTE: This rule is context-dependent (i.e. it'll generate useless noise if you've got a global guard) and so is OFF by default. It will need manually enabling in the rules section of your eslint config with `"@darraghor/nestjs-typed/api-methods-should-be-guarded": "error"`.

This PASSES - endpoint is protected by an AuthGuard

```ts
class TestClass {
    @Get()
    @UseGuards(AuthGuard('jwt'))
    public getAll(): Promise<string[]> {
        return [];
    }
}`
```

This PASSES - entire controller is protected by an AuthGuard

```ts
@UseGuards(AuthGuard('jwt'))
class TestClass {

    @Get()
    public getAll(): Promise<string[]> {
        return [];
    }

    @Get()
    public getOne(): Promise<string> {
        return "1";
    }
}
```

This PASSES - endpoint is protected by a custom Guard

```ts
class TestClass {
    @Post()
    @UseGuards(MyCustomGuard('hand-gestures'))
    public getAll(): Promise<string[]> {
        return [];
    }
}
```

This PASSES - it isn't a controller or an endpoint

```ts
class TestClass {
    public getAll(): Promise<string[]> {
        return [];
    }
}
```

This FAILS - neither the controller nor the endpoint is protected with a guard

```ts
class TestClass {
    @Get()
    public getAll(): Promise<string[]> {
        return [];
    }
}
```
