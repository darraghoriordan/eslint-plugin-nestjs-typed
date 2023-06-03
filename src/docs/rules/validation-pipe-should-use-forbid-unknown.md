### Rule: validation-pipe-should-forbid-unknown

This checks when if you are setting ValidationPipe parameters you set forbidUnknownValues to true.

The rule is ignored if you use a spread operator to pass options to the validation pipe constructor.

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
