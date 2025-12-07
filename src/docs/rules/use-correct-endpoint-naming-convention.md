### Rule: use-correct-endpoint-naming-convention

Enforces REST API naming conventions for controller and route paths following industry best practices from [RESTful API Resource Naming](https://restfulapi.net/resource-naming/).

**NOTE:** This rule is OFF by default. To enable it, add it to your ESLint configuration:

```json
{
  "rules": {
    "@darraghor/nestjs-typed/use-correct-endpoint-naming-convention": "error"
  }
}
```

#### Options

This rule accepts an options object with the following properties:

- `checkPluralization` (boolean, default: `true`): When enabled, enforces that controller paths use plural resource names (e.g., `users` instead of `user`)
- `caseFormat` (string, default: `"kebab-case"`): The case format to enforce for paths. Options:
  - `"kebab-case"`: lowercase with hyphens (e.g., `active-users`)
  - `"snake_case"`: lowercase with underscores (e.g., `active_users`)
  - `"camelCase"`: camelCase format (e.g., `activeUsers`)

#### Default Configuration

```json
{
  "checkPluralization": true,
  "caseFormat": "kebab-case"
}
```

#### Custom Configuration Examples

Disable pluralization checking:
```json
{
  "@darraghor/nestjs-typed/use-correct-endpoint-naming-convention": [
    "error",
    {
      "checkPluralization": false,
      "caseFormat": "kebab-case"
    }
  ]
}
```

Use snake_case instead of kebab-case:
```json
{
  "@darraghor/nestjs-typed/use-correct-endpoint-naming-convention": [
    "error",
    {
      "checkPluralization": true,
      "caseFormat": "snake_case"
    }
  ]
}
```

#### Valid Examples

✅ Controller with plural resource name in kebab-case:

```ts
@Controller('tests')
class TestClass {
    @Get()
    public getAll() {
        return [];
    }
}
```

✅ Controller with multi-word resource in kebab-case:

```ts
@Controller('test-cases')
class TestClass {
    @Get()
    public getAll() {
        return [];
    }
}
```

✅ Route with parameters (parameters are ignored in validation):

```ts
@Controller('tests')
class TestClass {
    @Get('some-param/:someParam')
    public getByParam(@Param('someParam') param) {
        return param;
    }
}
```

✅ Multiple path segments, all in correct format:

```ts
@Controller('users')
class TestClass {
    @Get('active-users/by-date')
    public getActiveUsers() {
        return [];
    }
}
```

✅ Using snake_case with custom configuration:

```ts
// Configuration: { "caseFormat": "snake_case" }
@Controller('test_cases')
class TestClass {
    @Get('active_users')
    public getActiveUsers() {
        return [];
    }
}
```

#### Invalid Examples

❌ Singular controller name (fails pluralization check):

```ts
@Controller('test')
class TestClass {
    @Get()
    public getAll() {
        return [];
    }
}
```

❌ camelCase used instead of kebab-case:

```ts
@Controller('tests')
class TestClass {
    @Get('getByParam/:someParam')
    public getByParam(@Param('someParam') param) {
        return param;
    }
}
```

❌ camelCase in controller path:

```ts
@Controller('testCases')
class TestClass {
    @Get()
    public getAll() {
        return [];
    }
}
```

❌ PascalCase in path:

```ts
@Controller('TestCases')
class TestClass {
    @Get()
    public getAll() {
        return [];
    }
}
```

#### Why This Rule Exists

Following consistent REST API naming conventions:
- Makes APIs more predictable and easier to understand
- Improves developer experience for API consumers
- Aligns with industry best practices
- Helps maintain a consistent codebase

#### Related Resources

- [RESTful API Resource Naming](https://restfulapi.net/resource-naming/)
- [REST API Best Practices](https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/)
