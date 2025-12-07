# api-property-should-have-api-extra-models

When using NestJS Swagger/OpenAPI decorators with `oneOf`, `allOf`, or `anyOf` options that reference models through `getSchemaPath()`, those models must be explicitly registered with `@ApiExtraModels()` decorator somewhere in your application. Otherwise, the referenced models will not be included in the generated OpenAPI schema.

## Rule Details

This rule checks for the use of `oneOf`, `allOf`, or `anyOf` in `@ApiProperty()` or `@ApiPropertyOptional()` decorators that reference models via `getSchemaPath()`.

Examples of **incorrect** code for this rule:

```ts
import { ApiProperty } from '@nestjs/swagger';
import { getSchemaPath } from '@nestjs/swagger';

class MyDto {
  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(Cat) },
      { $ref: getSchemaPath(Dog) },
    ],
  })
  pet: Cat | Dog;
}
```

Examples of **correct** code for this rule:

```ts
import { ApiProperty, ApiExtraModels } from '@nestjs/swagger';
import { getSchemaPath } from '@nestjs/swagger';

// Option 1: Add ApiExtraModels to the DTO
@ApiExtraModels(Cat, Dog)
class MyDto {
  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(Cat) },
      { $ref: getSchemaPath(Dog) },
    ],
  })
  pet: Cat | Dog;
}

// Option 2: Add ApiExtraModels to the controller
@ApiExtraModels(Cat, Dog)
@Controller('pets')
class PetController {
  // ...
}

// Option 3: Use the models directly as return types
@ApiOkResponse({ type: Cat })
someMethod(): Cat {
  // ...
}
```

## When Not To Use It

If you are not using NestJS Swagger/OpenAPI documentation features, you can disable this rule.

## Further Reading

- [NestJS OpenAPI - Extra Models](https://docs.nestjs.com/openapi/types-and-parameters#extra-models)
- [NestJS OpenAPI - oneOf, anyOf, allOf](https://docs.nestjs.com/openapi/types-and-parameters#oneof-anyof-allof)
