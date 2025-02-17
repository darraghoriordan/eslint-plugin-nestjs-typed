![commit](https://badgen.net/github/last-commit/darraghoriordan/eslint-plugin-nestjs-typed/main)
![npm](https://img.shields.io/npm/v/@darraghor/eslint-plugin-nestjs-typed.svg?color=red)
![npm-tag](https://badgen.net/github/tag/darraghoriordan/eslint-plugin-nestjs-typed)
![size](https://badgen.net/bundlephobia/minzip/@darraghor/eslint-plugin-nestjs-typed?color=cyan)
![types](https://badgen.net/npm/types/@darraghor/eslint-plugin-nestjs-typed?color=blue)

# NestJS Eslint Plugin

If you use NestJs (https://nestjs.com/) these ESLint rules will help you to prevent common bugs and issues in NestJs applications.

Skip to [How to configure](#to-configure) but if you have issues come back and read this whole document.

## Support this plugin

If you use this plugin in commercial setting consider submitting PRs on work time. It saves your business money, so it makes your business money!

If you really want to support me directly you can use https://darraghoriordan.gumroad.com/coffee

But please, just submit PRs to help all NestJS devs. This is the way!

## A note on versions

- Version `6.x` supports Eslint version `^9` and typescript eslint parser `^7` and `^8`
- Version `5.x` supports Eslint version `^8` and typescript eslint parser `^7` and `^8`
- Version `4.x` supports Eslint version `^8` and typescript eslint parser `^6`
- Version `3.x` supports Eslint version `^8` and typescript eslint parser `^5`
- Version `2.x` supports Eslint version `^7.x` and typescript eslint parser `^4`

## Eslint 9.x support

I have updated the configs to work with eslint 9.x. This is a breaking change.

If you are using eslint 8.x you should use version 5.x of this plugin.

I did try to leave the old style configs in place but I haven't tested them properly. If you have any issues please submit a PR.

See [How to configure](#to-configure) for more info.

## TS Eslint version support

There are breaking changes between versions of ts-eslint.

typescript eslint parser supports a range of typescript versions but there can be a delay in supporting the latest versions.

This plugin only supports typescript up to the version typescript eslint parser supports. See https://github.com/typescript-eslint/typescript-eslint#supported-typescript-version for the versions.

## Have an idea for a rule?

Awesome! [Click here](https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/issues/new?title=New%20Rule%20Suggestion&labels=Rule%20Suggestion&body=Hi!%20I%20have%20an%20idea%20for%20a%20rule...) to submit a new issue!

## Index of available rules

| Category                              | Rule                                                                                                                                 | is on in recommended ruleset? |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| Nest Modules and Dependency Injection | [`provided-injected-should-match-factory-parameters`](./src/docs/rules/provided-injected-should-match-factory-parameters.md)         | ✅                            |
|                                       | [`injectable-should-be-provided`](./src/docs/rules/injectable-should-be-provided.md)                                                 | ✅                            |
|                                       |                                                                                                                                      |                               |
| Nest Swagger                          | [`api-property-matches-property-optionality`](./src/docs/rules/api-property-matches-property-optionality.md)                         | ✅                            |
|                                       | [`controllers-should-supply-api-tags`](./src/docs/rules/controllers-should-supply-api-tags.md)                                       | ✅                            |
|                                       | [`api-method-should-specify-api-response`](./src/docs/rules/api-method-should-specify-api-response.md)                               | ✅                            |
|                                       | [`api-method-should-specify-api-operation`](./src/docs/rules/api-method-should-specify-api-operation.md)                             | ✅                            |
|                                       | [`api-enum-property-best-practices`](./src/docs/rules/api-enum-property-best-practices.md)                                           | ✅                            |
|                                       | [`api-property-returning-array-should-set-array`](./src/docs/rules/api-property-returning-array-should-set-array.md)                 | ✅                            |
|                                       |                                                                                                                                      |                               |
| Preventing bugs                       | [`param-decorator-name-matches-route-param`](./src/docs/rules/param-decorator-name-matches-route-param.md)                           | ✅                            |
|                                       | [`validate-nested-of-array-should-set-each`](./src/docs/rules/validate-nested-of-array-should-set-each.md)                           | ✅                            |
|                                       | [`validated-non-primitive-property-needs-type-decorator`](./src/docs/rules/validated-non-primitive-property-needs-type-decorator.md) | ✅                            |
|                                       | [`all-properties-are-whitelisted`](./src/docs/rules/all-properties-are-whitelisted.md)                                               | ✅                            |
|                                       | [`all-properties-have-explicit-defined`](./src/docs/rules/all-properties-have-explicit-defined.md)                                   | ✅                            |
|                                       | [`no-duplicate-decorators`](./src/docs/rules/no-duplicate-decorators.md)                                                             | ✅                            |
|                                       | [`should-specify-forbid-unknown-values`](./src/docs/rules/should-specify-forbid-unknown-values.md)                                   | ✅                            |
|                                       |                                                                                                                                      |                               |
| Security                              | [`api-methods-should-be-guarded`](./src/docs/rules/api-methods-should-be-guarded.md)                                                 | ❌                            |
|                                       |                                                                                                                                      |                               |
| Code Consistency                      | [`sort-module-metadata-arrays`](./src/docs/rules/sort-module-metadata-arrays.md)                                                     | ❌                            |

The "recommended" ruleset are the default rules that are turned on when you configure the plugin as described in this document.

The name "recommended" is an eslint convention, you can safely use the rules not in that list, they are just more opinionated.

## Who is this package for?

If you use NestJs (https://nestjs.com/) these ESLint rules will help you to prevent common bugs and issues in NestJs applications.

They mostly check that you are using decorators correctly.

The primary groupings of rules in this plugin are...

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

The plugin is on npm here: https://www.npmjs.com/package/@darraghor/eslint-plugin-nestjs-typed
You can see how the rules are used in this NestJS project: https://github.com/darraghoriordan/use-miller

```
npm install --save-dev @darraghor/eslint-plugin-nestjs-typed

// or

yarn add -D @darraghor/eslint-plugin-nestjs-typed
// or

pnpm add -D @darraghor/eslint-plugin-nestjs-typed
```

If you don't already have `class-validator` you should install that

```
npm install class-validator

// or

yarn add class-validator

// or

pnpm add class-validator
```

## To configure

Update your flat eslint config with the plugin import and add the flatRecommended rule set.

My config looks something like this. I'm 99% sure that you have to setup typescript parser also.

```ts
import eslintNestJs from "@darraghor/eslint-plugin-nestjs-typed";
// ... and all your other imports
export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
            parser,
            ecmaVersion: 2022,
            sourceType: "module",
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    eslintNestJs.configs.flatRecommended // This is the recommended ruleset for this plugin
);
```

For ESlint 8 I export the old style config in the "classicConfig" export.

I believe it would work something like this...

```ts
import {classicPlugin} from "@darraghor/eslint-plugin-nestjs-typed";

module.exports = {
    plugins: [classicPlugin],
};
```

## Injectables rule scans everything

Note: the injectables test scans your whole project. It's best to filter out ts things that don't matter - use `filterFromPaths` configuration setting for this. See the rule documentation for more info.

There are some sensible defaults already applied.

Note: You can easily turn off all the swagger rules if you don't use swagger by adding the `flatNoSwagger` rule set AFTER the recommended rule set.

```ts
// all the other config
    extends: [
       "plugin:@darraghor/nestjs-typed/recommended",
       "plugin:@darraghor/nestjs-typed/no-swagger"
    ],
 // more config
```

## Disabling a rule

Disable a single rule with the full name e.g. in your eslint configuration...

```ts
   rules: {
   "@darraghor/nestjs-typed/api-property-returning-array-should-set-array":
            "off",
   }
```
