![commit](https://badgen.net/github/last-commit/darraghoriordan/eslint-plugin-nestjs-typed/main)
![npm](https://img.shields.io/npm/v/@darraghor/eslint-plugin-nestjs-typed.svg?color=red)
![npm-tag](https://badgen.net/github/tag/darraghoriordan/eslint-plugin-nestjs-typed)
![size](https://badgen.net/bundlephobia/minzip/@darraghor/eslint-plugin-nestjs-typed?color=cyan)
![types](https://badgen.net/npm/types/@darraghor/eslint-plugin-nestjs-typed?color=blue)

## A note on versions

Version `4.x` supports Eslint version `>=8.x` and typescript eslint parser `^6`
Version `3.x` supports Eslint version `>=8.x` and typescript eslint parser `^5`
Version `2.x` supports Eslint version `<=7.x` and typescript eslint parser `^4`

There were many breaking changes between these versions.

typescript eslint parser supports a range of typescript versions but there can be a delay in supporting the latest versions.

This plugin only supports typescript up to the version typescript eslint parser supports. See https://github.com/typescript-eslint/typescript-eslint#supported-typescript-version for the versions.

## Index of available rules

Please check the recommended list (https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/blob/main/src/configs/recommended.ts) to check which rules are turned on when using that config.

Some rules are opinionated and have to be turned on explicitly (if they're not in the recommended config pack).

| Category                              | Rule                                                                                                                                 | is in recommended config |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ |
| Nest Modules and Dependency Injection | [`provided-injected-should-match-factory-parameters`](./src/docs/rules/provided-injected-should-match-factory-parameters.md)         | Y                        |
|                                       | [`injectable-should-be-provided`](./src/docs/rules/injectable-should-be-provided.md)                                                 | Y                        |
|                                       |                                                                                                                                      |                          |
| Nest Swagger                          | [`api-property-matches-property-optionality`](./src/docs/rules/api-property-matches-property-optionality.md)                         | Y                        |
|                                       | [`controllers-should-supply-api-tags`](./src/docs/rules/controllers-should-supply-api-tags.md)                                       | Y                        |
|                                       | [`api-method-should-specify-api-response`](./src/docs/rules/api-method-should-specify-api-response.md)                               | N                        |
|                                       | [`api-method-should-specify-api-operation`](./src/docs/rules/api-method-should-specify-api-operation.md)                             | Y                        |
|                                       | [`api-enum-property-best-practices`](./src/docs/rules/api-enum-property-best-practices.md)                                           | Y                        |
|                                       | [`api-property-returning-array-should-set-array`](./src/docs/rules/api-property-returning-array-should-set-array.md)                 | Y                        |
|                                       |                                                                                                                                      |                          |
| Preventing bugs                       | [`param-decorator-name-matches-route-param`](./src/docs/rules/param-decorator-name-matches-route-param.md)                           | Y                        |
|                                       | [`validate-nested-of-array-should-set-each`](./src/docs/rules/validate-nested-of-array-should-set-each.md)                           | Y                        |
|                                       | [`validated-non-primitive-property-needs-type-decorator`](./src/docs/rules/validated-non-primitive-property-needs-type-decorator.md) | Y                        |
|                                       | [`all-properties-are-whitelisted`](./src/docs/rules/all-properties-are-whitelisted.md)                                               | Y                        |
|                                       | [`all-properties-have-explicit-defined`](./src/docs/rules/all-properties-have-explicit-defined.md)                                   | Y                        |
|                                       |                                                                                                                                      |                          |
| Security                              | [`validation-pipe-should-forbid-unknown`](./src/docs/rules/validation-pipe-should-use-forbid-unknown.md)                             | Y                        |
|                                       | [`api-methods-should-be-guarded`](./src/docs/rules/api-methods-should-be-guarded.md)                                                 | N                        |
|                                       |                                                                                                                                      |                          |
| Code Consistency                      | [`sort-module-metadata-arrays`](./src/docs/rules/sort-module-metadata-arrays.md)                                                     | N                        |

Detailed docs are available here: https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/tree/main/src/docs/rules

## Who is this package for?

If you use NestJs (https://nestjs.com/) these ESLint rules will help you to prevent common bugs and issues in NestJs applications.

They mostly check that you are using decorators correctly.

The three primary groupings of rules in this plugin are...

### 1. Detect Nest Dependency Injection issues

The Nest DI is declarative and if you forget to provide an injectable you wont see an error until run time. Nest is good at telling you where these are but sometimes it's not.

In particular if you're using custom providers the errors can be really tricky to figure out because they won't explicitly error about mismatched injected items, you will just get unexpected operation.

These are described in the "Common Errors" section of the nest js docs.

### 2. Using Open Api / Swagger decorators and automatically generating a clients

When working with NestJS I generate my front end client and models using the swagger/Open API specification generated directly from the nest controllers and models.

I have a bunch of rules here that enforce strict Open API typing with decorators for NestJs controllers and models.

These rules are opinionated, but necessary for clean model generation if using an Open Api client generator later in your build.

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

## To configure

You can see how the rules are used in this NestJS project: https://github.com/darraghoriordan/use-miller

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
